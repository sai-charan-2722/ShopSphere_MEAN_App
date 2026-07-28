import mongoose, { Schema, model, type Document } from 'mongoose';
import type { Role } from '../types';

export interface IUser extends Document {
  clerkId: string; // Clerk userId — primary auth reference
  name: string;
  email: string;
  avatar?: string; // Cloudinary URL
  role: Role;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlist: mongoose.Types.ObjectId[]; // ref: Product
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    avatar: { type: String },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', UserSchema);
