import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { Cart } from '../models/Cart.model';
import { Order, type IOrderItem } from '../models/Order.model';
import { Product, type IProduct } from '../models/Product.model';
import { User } from '../models/User.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { checkoutSchema } from '../validators';
import { HttpError } from '../types';
import { emitNewOrderToSeller, emitPaymentConfirmedToBuyer } from '../sockets/order.socket';
import { emailService } from '../services/email.service';

const SHIPPING_FREE_THRESHOLD = 50000; // paise (₹500)
const SHIPPING_FEE = 4900; // paise (₹49)
const TAX_RATE = 0.18; // 18% GST

interface PopulatedCartItem {
  product: IProduct;
  quantity: number;
  priceAtAdd: number;
}

/** POST /api/payment/create-checkout-session — buyer. */
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const { shippingAddress } = checkoutSchema.parse(req.body);
  const user = await getCurrentUser(req);

  const cart = await Cart.findOne({ user: user._id }).populate<{ items: PopulatedCartItem[] }>({
    path: 'items.product',
  });
  if (!cart || cart.items.length === 0) throw new HttpError(400, 'Your cart is empty');

  // Validate stock + build order items snapshot
  const orderItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) throw new HttpError(400, 'A product in your cart is no longer available');
    if (product.stock < item.quantity) throw new HttpError(400, `Insufficient stock for "${product.title}"`);

    const unitPrice = product.discountPrice ?? product.price;
    subtotal += unitPrice * item.quantity;

    orderItems.push({
      product: product._id as never,
      title: product.title,
      image: product.images[0] ?? '',
      quantity: item.quantity,
      price: unitPrice,
      seller: product.seller as never,
    });
  }

  const shippingFee = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + shippingFee + tax;

  // Create a pending order up-front; the webhook confirms it as paid.
  const order = await Order.create({
    buyer: user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    tax,
    totalAmount,
    paymentStatus: 'pending',
    orderStatus: 'placed',
    statusHistory: [{ status: 'placed', timestamp: new Date(), note: 'Order created, awaiting payment' }],
  });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
    price_data: {
      currency: env.stripe.currency,
      product_data: {
        name: item.product.title,
        images: item.product.images[0] ? [item.product.images[0]] : undefined,
        metadata: { productId: String(item.product._id) },
      },
      unit_amount: item.product.discountPrice ?? item.product.price,
    },
    quantity: item.quantity,
  }));

  if (shippingFee > 0) {
    lineItems.push({
      price_data: {
        currency: env.stripe.currency,
        product_data: { name: 'Shipping' },
        unit_amount: shippingFee,
      },
      quantity: 1,
    });
  }
  lineItems.push({
    price_data: {
      currency: env.stripe.currency,
      product_data: { name: 'Tax (GST 18%)' },
      unit_amount: tax,
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    metadata: { orderId: String(order._id), buyerId: String(user._id) },
    customer_email: user.email,
    success_url: `${env.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/cart`,
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.json(ApiResponse.ok({ sessionUrl: session.url, sessionId: session.id }, 'Checkout session created'));
};

/** Fulfil a paid order: decrement stock, clear cart, email, emit sockets. */
async function fulfilOrder(orderId: string, paymentIntentId?: string): Promise<void> {
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === 'paid') return; // idempotent

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  if (paymentIntentId) order.stripePaymentIntentId = paymentIntentId;
  order.statusHistory.push({ status: 'confirmed', timestamp: new Date(), note: 'Payment confirmed' });
  await order.save();

  // Decrement stock and clear the buyer's cart
  await Promise.all([
    ...order.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })),
    Cart.updateOne({ user: order.buyer }, { $set: { items: [] } }),
  ]);

  // Notify buyer
  const buyer = await User.findById(order.buyer).lean();
  if (buyer) {
    await emailService.orderConfirmed(buyer.email, {
      name: buyer.name,
      orderId: String(order._id),
      total: order.totalAmount,
    });
  }
  emitPaymentConfirmedToBuyer(String(order.buyer), { orderId: String(order._id) });

  // Notify each unique seller
  const sellerIds = [...new Set(order.items.map((i) => String(i.seller)))];
  for (const sellerId of sellerIds) {
    emitNewOrderToSeller(sellerId, {
      orderId: String(order._id),
      total: order.totalAmount,
      items: order.items.filter((i) => String(i.seller) === sellerId),
    });
    const seller = await User.findById(sellerId).lean();
    if (seller) {
      await emailService.newOrderSeller(seller.email, {
        name: seller.name,
        orderId: String(order._id),
        total: order.totalAmount,
      });
    }
  }
}

/**
 * POST /api/payment/webhook — Stripe webhook (raw body).
 * Handles checkout.session.completed and payment_intent.payment_failed.
 */
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.header('stripe-signature');
  if (!sig) throw new HttpError(400, 'Missing Stripe signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.stripe.webhookSecret);
  } catch (err) {
    throw new HttpError(400, `Webhook signature verification failed: ${(err as Error).message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await fulfilOrder(orderId, (session.payment_intent as string | null) ?? undefined);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata?.orderId;
      if (orderId) await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
};

/** GET /api/payment/success?session_id= — verify + return the confirmed order. */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.query.session_id as string | undefined;
  if (!sessionId) throw new HttpError(400, 'session_id is required');

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;
  if (!orderId) throw new HttpError(404, 'Order not found for this session');

  // Fallback fulfilment in case the webhook is delayed (e.g. local dev without Stripe CLI).
  if (session.payment_status === 'paid') {
    await fulfilOrder(orderId, (session.payment_intent as string | null) ?? undefined);
  }

  const order = await Order.findById(orderId).lean();
  if (!order) throw new HttpError(404, 'Order not found');

  res.json(ApiResponse.ok(order, 'Payment verified'));
};
