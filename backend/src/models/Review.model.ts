import mongoose, { Schema, model, type Document } from 'mongoose';
import { Product } from './Product.model';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId; // review only allowed after purchase
  rating: number; // 1–5
  title: string;
  comment: string;
  images?: string[]; // optional review images
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

/** Recalculate a product's average rating + review count from its reviews. */
async function recalcProductRating(productId: mongoose.Types.ObjectId): Promise<void> {
  const stats = await Review.aggregate<{ _id: mongoose.Types.ObjectId; avgRating: number; count: number }>([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratings: stats[0]?.avgRating ? Number(stats[0].avgRating.toFixed(1)) : 0,
    numReviews: stats[0]?.count ?? 0,
  });
}

// Post-save hook: recalculate product ratings
ReviewSchema.post('save', async function () {
  await recalcProductRating(this.product);
});

// Keep ratings consistent when a review is deleted via findByIdAndDelete / findOneAndDelete
ReviewSchema.post('findOneAndDelete', async function (doc: IReview | null) {
  if (doc) await recalcProductRating(doc.product);
});

export const Review = model<IReview>('Review', ReviewSchema);
