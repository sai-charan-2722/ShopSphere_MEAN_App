import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.model';
import { Product } from '../models/Product.model';
import { Order } from '../models/Order.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination, buildMeta } from '../utils/pagination';
import { updateProfileSchema } from '../validators';
import { HttpError } from '../types';

/** GET /api/users/profile */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  res.json(ApiResponse.ok(user));
};

/** PUT /api/users/profile */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const dto = updateProfileSchema.parse(req.body);
  const user = await getCurrentUser(req);

  if (dto.name !== undefined) user.name = dto.name;
  if (dto.avatar !== undefined) user.avatar = dto.avatar;
  if (dto.address !== undefined) user.address = dto.address;

  await user.save();
  res.json(ApiResponse.ok(user, 'Profile updated'));
};

/** GET /api/users/wishlist */
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const populated = await user.populate({
    path: 'wishlist',
    match: { isActive: true },
    populate: { path: 'category', select: 'name slug' },
  });
  res.json(ApiResponse.ok(populated.wishlist));
};

/** POST /api/users/wishlist/:productId */
export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  const { productId } = z.object({ productId: z.string().regex(/^[0-9a-fA-F]{24}$/) }).parse(req.params);

  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, 'Product not found');

  const user = await getCurrentUser(req);
  await User.updateOne({ _id: user._id }, { $addToSet: { wishlist: product._id } });

  res.json(ApiResponse.ok(null, 'Added to wishlist'));
};

/** DELETE /api/users/wishlist/:productId */
export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  const { productId } = z.object({ productId: z.string().regex(/^[0-9a-fA-F]{24}$/) }).parse(req.params);
  const user = await getCurrentUser(req);
  await User.updateOne({ _id: user._id }, { $pull: { wishlist: productId } });
  res.json(ApiResponse.ok(null, 'Removed from wishlist'));
};

/** GET /api/users/orders — buyer's own order history (paginated). */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  const { page, limit, skip } = parsePagination(req.query);

  const [orders, total] = await Promise.all([
    Order.find({ buyer: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ buyer: user._id }),
  ]);

  res.json(ApiResponse.ok(orders, 'Orders fetched', buildMeta(page, limit, total)));
};
