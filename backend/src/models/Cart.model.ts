import mongoose, { Schema, model, type Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId; // ref: Product
  quantity: number;
  priceAtAdd: number; // price snapshot (paise) at time of adding
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId; // ref: User, unique
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        priceAtAdd: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const Cart = model<ICart>('Cart', CartSchema);
