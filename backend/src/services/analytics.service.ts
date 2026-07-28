import mongoose from 'mongoose';
import { Order } from '../models/Order.model';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';

type Interval = 'daily' | 'weekly' | 'monthly';

function dateFormatForInterval(interval: Interval): string {
  switch (interval) {
    case 'weekly':
      return '%Y-%U';
    case 'monthly':
      return '%Y-%m';
    case 'daily':
    default:
      return '%Y-%m-%d';
  }
}

// ─────────────────────────────────────────────────────────
// SELLER ANALYTICS
// ─────────────────────────────────────────────────────────

/** Total revenue, order count, product count, and average rating for one seller. */
export async function sellerOverview(sellerId: string): Promise<{
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgRating: number;
}> {
  const sid = new mongoose.Types.ObjectId(sellerId);

  const revenueAgg = await Order.aggregate<{ totalRevenue: number; orders: Set<unknown> }>([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sid } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderIds: { $addToSet: '$_id' },
      },
    },
    { $project: { totalRevenue: 1, totalOrders: { $size: '$orderIds' } } },
  ]);

  const [productCount, ratingAgg] = await Promise.all([
    Product.countDocuments({ seller: sid, isActive: true }),
    Product.aggregate<{ avg: number }>([
      { $match: { seller: sid, numReviews: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$ratings' } } },
    ]),
  ]);

  const rev = revenueAgg[0] as unknown as { totalRevenue?: number; totalOrders?: number } | undefined;

  return {
    totalRevenue: rev?.totalRevenue ?? 0,
    totalOrders: rev?.totalOrders ?? 0,
    totalProducts: productCount,
    avgRating: ratingAgg[0]?.avg ? Number(ratingAgg[0].avg.toFixed(1)) : 0,
  };
}

/** Revenue grouped over time for one seller. */
export async function sellerRevenueOverTime(
  sellerId: string,
  interval: Interval = 'daily',
): Promise<{ period: string; revenue: number; orders: number }[]> {
  const sid = new mongoose.Types.ObjectId(sellerId);
  const rows = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sid } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormatForInterval(interval), date: '$createdAt' } },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
      },
    },
    { $project: { period: '$_id', revenue: 1, orders: { $size: '$orders' }, _id: 0 } },
    { $sort: { period: 1 } },
  ]);
  return rows as { period: string; revenue: number; orders: number }[];
}

/** Top 5 products by revenue for one seller. */
export async function sellerTopProducts(
  sellerId: string,
): Promise<{ productId: string; title: string; revenue: number; unitsSold: number }[]> {
  const sid = new mongoose.Types.ObjectId(sellerId);
  const rows = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sid } },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    { $project: { productId: '$_id', title: 1, revenue: 1, unitsSold: 1, _id: 0 } },
  ]);
  return rows as { productId: string; title: string; revenue: number; unitsSold: number }[];
}

/** Count of orders by fulfilment status for one seller. */
export async function sellerOrdersByStatus(sellerId: string): Promise<Record<string, number>> {
  const sid = new mongoose.Types.ObjectId(sellerId);
  const rows = await Order.aggregate<{ _id: string; count: number }>([
    { $match: { 'items.seller': sid } },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.count]));
}

// ─────────────────────────────────────────────────────────
// ADMIN ANALYTICS
// ─────────────────────────────────────────────────────────

/** Platform-wide statistics. */
export async function adminOverview(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalSellers: number;
}> {
  const [revenueAgg, totalOrders, totalProducts, totalUsers, totalSellers] = await Promise.all([
    Order.aggregate<{ total: number }>([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ paymentStatus: 'paid' }),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'seller', isActive: true }),
  ]);

  return {
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalOrders,
    totalProducts,
    totalUsers,
    totalSellers,
  };
}

/** Platform revenue grouped over time. */
export async function adminRevenueOverTime(
  interval: Interval = 'daily',
): Promise<{ period: string; revenue: number; orders: number }[]> {
  const rows = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormatForInterval(interval), date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $project: { period: '$_id', revenue: 1, orders: 1, _id: 0 } },
    { $sort: { period: 1 } },
  ]);
  return rows as { period: string; revenue: number; orders: number }[];
}

/** New-user growth over time (for admin analytics charts). */
export async function adminUserGrowth(
  interval: Interval = 'monthly',
): Promise<{ period: string; users: number }[]> {
  const rows = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: dateFormatForInterval(interval), date: '$createdAt' } },
        users: { $sum: 1 },
      },
    },
    { $project: { period: '$_id', users: 1, _id: 0 } },
    { $sort: { period: 1 } },
  ]);
  return rows as { period: string; users: number }[];
}
