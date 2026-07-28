import type { Request, Response } from 'express';
import { z } from 'zod';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { addToCartSchema, updateCartItemSchema } from '../validators';
import { HttpError } from '../types';

const productIdParam = z.object({ productId: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** Return the buyer's cart with populated product data (creating an empty one if needed). */
async function getPopulatedCart(userId: unknown) {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, new: true },
  ).populate({ path: 'items.product', select: 'title images price discountPrice stock seller isActive' });
  return cart;
}

/** GET /api/cart */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const cart = await getPopulatedCart(user._id);
  res.json(ApiResponse.ok(cart));
};

/** POST /api/cart/add */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const dto = addToCartSchema.parse(req.body);
  const user = await getCurrentUser(req);

  const product = await Product.findOne({ _id: dto.productId, isActive: true });
  if (!product) throw new HttpError(404, 'Product not found');
  if (product.stock < dto.quantity) throw new HttpError(400, 'Insufficient stock');

  const cart = await Cart.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id } },
    { upsert: true, new: true },
  );

  const priceNow = product.discountPrice ?? product.price;
  const existing = cart.items.find((i) => String(i.product) === dto.productId);

  if (existing) {
    const newQty = existing.quantity + dto.quantity;
    if (product.stock < newQty) throw new HttpError(400, 'Insufficient stock');
    existing.quantity = newQty;
    existing.priceAtAdd = priceNow;
  } else {
    cart.items.push({ product: product._id, quantity: dto.quantity, priceAtAdd: priceNow });
  }

  await cart.save();
  const populated = await getPopulatedCart(user._id);
  res.json(ApiResponse.ok(populated, 'Item added to cart'));
};

/** PUT /api/cart/item/:productId */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId } = productIdParam.parse(req.params);
  const { quantity } = updateCartItemSchema.parse(req.body);
  const user = await getCurrentUser(req);

  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, 'Product not found');
  if (product.stock < quantity) throw new HttpError(400, 'Insufficient stock');

  const cart = await Cart.findOne({ user: user._id });
  if (!cart) throw new HttpError(404, 'Cart not found');

  const item = cart.items.find((i) => String(i.product) === productId);
  if (!item) throw new HttpError(404, 'Item not in cart');
  item.quantity = quantity;

  await cart.save();
  const populated = await getPopulatedCart(user._id);
  res.json(ApiResponse.ok(populated, 'Cart updated'));
};

/** DELETE /api/cart/item/:productId */
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId } = productIdParam.parse(req.params);
  const user = await getCurrentUser(req);

  await Cart.updateOne({ user: user._id }, { $pull: { items: { product: productId } } });
  const populated = await getPopulatedCart(user._id);
  res.json(ApiResponse.ok(populated, 'Item removed'));
};

/** DELETE /api/cart/clear */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  await Cart.updateOne({ user: user._id }, { $set: { items: [] } });
  res.json(ApiResponse.ok(null, 'Cart cleared'));
};
