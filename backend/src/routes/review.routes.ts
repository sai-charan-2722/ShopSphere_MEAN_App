import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';

export const reviewRouter = Router();

// Public
reviewRouter.get('/product/:productId', asyncHandler(getProductReviews));

// Buyer
reviewRouter.post('/', requireAuth, requireRole('buyer', 'seller'), asyncHandler(createReview));
reviewRouter.put('/:id', requireAuth, requireRole('buyer', 'seller'), asyncHandler(updateReview));
reviewRouter.delete('/:id', requireAuth, requireRole('buyer', 'seller', 'admin'), asyncHandler(deleteReview));
