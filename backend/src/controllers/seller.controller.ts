import type { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.model';
import { Order } from '../models/Order.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination, buildMeta } from '../utils/pagination';
import { orderStatusSchema } from '../validators';
import { HttpError } from '../types';
import { emitOrderStatusToBuyer } from '../sockets/order.socket';
import {
  sellerOverview,
  sellerRevenueOverTime,
  sellerTopProducts,
  sellerOrdersByStatus,
} from '../services/analytics.service';

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** GET /api/seller/products — own products (paginated). */
export const getSellerProducts = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { seller: user._id };
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name slug').lean(),
    Product.countDocuments(filter),
  ]);

  res.json(ApiResponse.ok(products, 'Products fetched', buildMeta(page, limit, total)));
};

/** GET /api/seller/orders — orders containing the seller's products. */
export const getSellerOrders = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { 'items.seller': user._id };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyer', 'name email').lean(),
    Order.countDocuments(filter),
  ]);

  // Only expose this seller's line items in each order.
  const scoped = orders.map((o) => ({
    ...o,
    items: o.items.filter((i) => String(i.seller) === String(user._id)),
  }));

  res.json(ApiResponse.ok(scoped, 'Orders fetched', buildMeta(page, limit, total)));
};

/** PUT /api/seller/orders/:id/status — update fulfilment status for own items. */
export const updateSellerOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const dto = orderStatusSchema.parse(req.body);
  const user = await getCurrentUser(req);

  const order = await Order.findOne({ _id: id, 'items.seller': user._id });
  if (!order) throw new HttpError(404, 'Order not found or contains none of your products');

  order.orderStatus = dto.status;
  if (dto.trackingNumber) order.trackingNumber = dto.trackingNumber;
  order.statusHistory.push({ status: dto.status, timestamp: new Date(), note: dto.note });
  await order.save();

  emitOrderStatusToBuyer(String(order.buyer), {
    orderId: String(order._id),
    status: dto.status,
    note: dto.note,
  });

  res.json(ApiResponse.ok(order, 'Order status updated'));
};

/** GET /api/seller/analytics/overview */
export const getSellerOverview = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const data = await sellerOverview(String(user._id));
  res.json(ApiResponse.ok(data));
};

/** GET /api/seller/analytics/revenue?interval=daily|weekly|monthly */
export const getSellerRevenue = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const interval = (req.query.interval as 'daily' | 'weekly' | 'monthly') ?? 'daily';
  const data = await sellerRevenueOverTime(String(user._id), interval);
  res.json(ApiResponse.ok(data));
};

/** GET /api/seller/analytics/top-products */
export const getSellerTopProducts = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const data = await sellerTopProducts(String(user._id));
  res.json(ApiResponse.ok(data));
};

/** GET /api/seller/analytics/orders-by-status */
export const getSellerOrdersByStatus = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const data = await sellerOrdersByStatus(String(user._id));
  res.json(ApiResponse.ok(data));
};
