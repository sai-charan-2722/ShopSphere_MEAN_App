import type { Request, Response } from 'express';
import { z } from 'zod';
import { Review } from '../models/Review.model';
import { Order } from '../models/Order.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination, buildMeta } from '../utils/pagination';
import { createReviewSchema, updateReviewSchema } from '../validators';
import { HttpError } from '../types';

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** GET /api/reviews/product/:productId — public, paginated. */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const { productId } = z.object({ productId: z.string().regex(/^[0-9a-fA-F]{24}$/) }).parse(req.params);
  const { page, limit, skip } = parsePagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar')
      .lean(),
    Review.countDocuments({ product: productId }),
  ]);

  res.json(ApiResponse.ok(reviews, 'Reviews fetched', buildMeta(page, limit, total)));
};

/** POST /api/reviews — buyer, only after a verified purchase. */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  const dto = createReviewSchema.parse(req.body);
  const user = await getCurrentUser(req);

  // Verify the order belongs to the buyer and contains this product.
  const order = await Order.findOne({
    _id: dto.orderId,
    buyer: user._id,
    'items.product': dto.productId,
  });
  if (!order) throw new HttpError(403, 'You can only review products you have purchased');
  if (order.paymentStatus !== 'paid') throw new HttpError(400, 'Order payment is not complete');

  const existing = await Review.findOne({ product: dto.productId, user: user._id });
  if (existing) throw new HttpError(409, 'You have already reviewed this product');

  const review = await Review.create({
    product: dto.productId,
    user: user._id,
    order: dto.orderId,
    rating: dto.rating,
    title: dto.title,
    comment: dto.comment,
    isVerifiedPurchase: true,
  });

  res.status(201).json(ApiResponse.ok(review, 'Review submitted'));
};

/** PUT /api/reviews/:id — buyer (own). */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const dto = updateReviewSchema.parse(req.body);
  const user = await getCurrentUser(req);

  const review = await Review.findById(id);
  if (!review) throw new HttpError(404, 'Review not found');
  if (String(review.user) !== String(user._id)) throw new HttpError(403, 'Forbidden');

  Object.assign(review, dto);
  await review.save(); // triggers ratings recalculation via post-save hook

  res.json(ApiResponse.ok(review, 'Review updated'));
};

/** DELETE /api/reviews/:id — buyer(own)/admin. */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);

  const review = await Review.findById(id);
  if (!review) throw new HttpError(404, 'Review not found');

  if (req.role !== 'admin') {
    const user = await getCurrentUser(req);
    if (String(review.user) !== String(user._id)) throw new HttpError(403, 'Forbidden');
  }

  await Review.findByIdAndDelete(id); // triggers recalculation via post hook
  res.json(ApiResponse.ok(null, 'Review deleted'));
};
