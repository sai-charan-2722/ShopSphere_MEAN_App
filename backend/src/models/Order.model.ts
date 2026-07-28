import mongoose, { Schema, model, type Document } from 'mongoose';
import type { OrderStatus, PaymentStatus } from '../types';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string; // snapshot
  image: string; // snapshot
  quantity: number;
  price: number; // price at purchase in paise
  seller: mongoose.Types.ObjectId;
}

export interface IShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  orderStatus: OrderStatus;
  statusHistory: IStatusHistory[];
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
      default: 'placed',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
        },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    trackingNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ 'items.seller': 1, orderStatus: 1 });

export const Order = model<IOrder>('Order', OrderSchema);
