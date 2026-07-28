import mongoose, { Schema, model, type Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number; // in paise (INR * 100) for Stripe compatibility
  discountPrice?: number; // sale price in paise
  images: string[]; // Cloudinary URLs (max 5)
  category: mongoose.Types.ObjectId; // ref: Category
  seller: mongoose.Types.ObjectId; // ref: User (role: seller)
  stock: number;
  sku?: string;
  tags: string[];
  ratings: number; // average, auto-recalculated
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String },
    tags: [{ type: String }],
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Full-text search index
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Compound index for filtering
ProductSchema.index({ category: 1, price: 1, ratings: -1 });
ProductSchema.index({ seller: 1, isActive: 1 });

export const Product = model<IProduct>('Product', ProductSchema);
