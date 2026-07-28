import type { Request, Response } from 'express';
import { z } from 'zod';
import { clerkClient } from '@clerk/express';
import { User } from '../models/User.model';
import { Product } from '../models/Product.model';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination, buildMeta } from '../utils/pagination';
import { changeRoleSchema, changeStatusSchema } from '../validators';
import { HttpError } from '../types';
import { adminOverview, adminRevenueOverTime, adminUserGrowth } from '../services/analytics.service';

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** GET /api/admin/users — paginated + search. */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search as string | undefined;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json(ApiResponse.ok(users, 'Users fetched', buildMeta(page, limit, total)));
};

/** PUT /api/admin/users/:id/role — update role in Mongo AND Clerk metadata. */
export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const { role } = changeRoleSchema.parse(req.body);

  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'User not found');

  user.role = role;
  await user.save();

  // Keep Clerk publicMetadata in sync so the role is reflected on next request.
  try {
    await clerkClient.users.updateUserMetadata(user.clerkId, { publicMetadata: { role } });
  } catch (err) {
    console.warn('Failed to sync role to Clerk:', err);
  }

  res.json(ApiResponse.ok(user, 'Role updated'));
};

/** PUT /api/admin/users/:id/status — activate/deactivate. */
export const changeUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const { isActive } = changeStatusSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) throw new HttpError(404, 'User not found');

  res.json(ApiResponse.ok(user, `User ${isActive ? 'activated' : 'deactivated'}`));
};

/** GET /api/admin/analytics/overview */
export const getAdminOverview = async (_req: Request, res: Response): Promise<void> => {
  const data = await adminOverview();
  res.json(ApiResponse.ok(data));
};

/** GET /api/admin/analytics/revenue?interval= */
export const getAdminRevenue = async (req: Request, res: Response): Promise<void> => {
  const interval = (req.query.interval as 'daily' | 'weekly' | 'monthly') ?? 'daily';
  const [revenue, userGrowth] = await Promise.all([adminRevenueOverTime(interval), adminUserGrowth('monthly')]);
  res.json(ApiResponse.ok({ revenue, userGrowth }));
};

/** GET /api/admin/products — all products including inactive. */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search as string | undefined;

  const filter: Record<string, unknown> = {};
  if (search) filter.title = { $regex: search, $options: 'i' };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('seller', 'name email')
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json(ApiResponse.ok(products, 'Products fetched', buildMeta(page, limit, total)));
};

/** PUT /api/admin/products/:id/featured — toggle featured. */
export const toggleFeatured = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found');

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.json(ApiResponse.ok(product, `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`));
};
