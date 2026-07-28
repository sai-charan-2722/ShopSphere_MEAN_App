import type { Request, Response } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order.model';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination, buildMeta } from '../utils/pagination';
import { orderStatusSchema } from '../validators';
import { HttpError, type OrderStatus } from '../types';
import { emitOrderStatusToBuyer } from '../sockets/order.socket';
import { emailService } from '../services/email.service';

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** GET /api/orders — buyer's own orders (paginated). */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const { page, limit, skip } = parsePagination(req.query);

  const [orders, total] = await Promise.all([
    Order.find({ buyer: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ buyer: user._id }),
  ]);

  res.json(ApiResponse.ok(orders, 'Orders fetched', buildMeta(page, limit, total)));
};

/** GET /api/orders/:id — buyer(own)/admin. */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const order = await Order.findById(id).populate('items.product', 'title images slug').lean();
  if (!order) throw new HttpError(404, 'Order not found');

  if (req.role !== 'admin') {
    const user = await getCurrentUser(req);
    if (String(order.buyer) !== String(user._id)) throw new HttpError(403, 'Forbidden');
  }

  res.json(ApiResponse.ok(order));
};

/** PUT /api/orders/:id/cancel — buyer can cancel only while 'placed'. */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const user = await getCurrentUser(req);

  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (String(order.buyer) !== String(user._id)) throw new HttpError(403, 'Forbidden');
  if (order.orderStatus !== 'placed') {
    throw new HttpError(400, 'Only orders with status "placed" can be cancelled');
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: 'Cancelled by buyer' });
  await order.save();

  // Restore stock
  await Promise.all(
    order.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })),
  );

  emitOrderStatusToBuyer(String(user._id), { orderId: String(order._id), status: 'cancelled' });
  await emailService.orderCancelled(user.email, { name: user.name, orderId: String(order._id) });

  res.json(ApiResponse.ok(order, 'Order cancelled'));
};

/** GET /api/orders/admin/all — admin, paginated + filtered. */
export const adminGetAllOrders = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query);
  const status = req.query.status as string | undefined;
  const paymentStatus = req.query.paymentStatus as string | undefined;

  const filter: Record<string, unknown> = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('buyer', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json(ApiResponse.ok(orders, 'Orders fetched', buildMeta(page, limit, total)));
};

/** Send the appropriate email for a status transition. */
async function notifyStatusEmail(order: { _id: unknown; buyer: unknown; trackingNumber?: string }, status: OrderStatus): Promise<void> {
  const buyer = await User.findById(order.buyer).lean();
  if (!buyer) return;
  const orderId = String(order._id);
  if (status === 'shipped') {
    await emailService.orderShipped(buyer.email, { name: buyer.name, orderId, tracking: order.trackingNumber ?? 'N/A' });
  } else if (status === 'delivered') {
    await emailService.orderDelivered(buyer.email, { name: buyer.name, orderId });
  } else if (status === 'cancelled') {
    await emailService.orderCancelled(buyer.email, { name: buyer.name, orderId });
  }
}

/** PUT /api/orders/admin/:id/status — admin updates status + emits socket event. */
export const adminUpdateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const dto = orderStatusSchema.parse(req.body);

  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, 'Order not found');

  order.orderStatus = dto.status;
  if (dto.trackingNumber) order.trackingNumber = dto.trackingNumber;
  order.statusHistory.push({ status: dto.status, timestamp: new Date(), note: dto.note });
  await order.save();

  emitOrderStatusToBuyer(String(order.buyer), {
    orderId: String(order._id),
    status: dto.status,
    note: dto.note,
  });
  await notifyStatusEmail(order, dto.status);

  res.json(ApiResponse.ok(order, 'Order status updated'));
};
