import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getMyOrders,
} from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/profile', asyncHandler(getProfile));
userRouter.put('/profile', asyncHandler(updateProfile));

userRouter.get('/wishlist', requireRole('buyer', 'seller'), asyncHandler(getWishlist));
userRouter.post('/wishlist/:productId', requireRole('buyer', 'seller'), asyncHandler(addToWishlist));
userRouter.delete('/wishlist/:productId', requireRole('buyer', 'seller'), asyncHandler(removeFromWishlist));

userRouter.get('/orders', requireRole('buyer', 'seller'), asyncHandler(getMyOrders));
