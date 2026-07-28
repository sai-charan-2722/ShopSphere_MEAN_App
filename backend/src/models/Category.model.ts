import mongoose, { Schema, model, type Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string; // URL-friendly, auto-generated
  image?: string; // Cloudinary URL
  parent?: mongoose.Types.ObjectId | null; // ref: Category (for subcategories)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Category = model<ICategory>('Category', CategorySchema);
