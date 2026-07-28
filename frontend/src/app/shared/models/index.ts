// Frontend-facing interfaces mirroring the backend data models.

export type Role = 'buyer' | 'seller' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IUser {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  address?: Address;
  wishlist: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent?: string | null;
  isActive: boolean;
  children?: ICategory[];
}

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  price: number; // paise
  discountPrice?: number; // paise
  images: string[];
  category: ICategory | string;
  seller: Pick<IUser, '_id' | 'name' | 'avatar' | 'email'> | string;
  stock: number;
  sku?: string;
  tags: string[];
  ratings: number;
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: IProduct;
  quantity: number;
  priceAtAdd: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: string | IProduct;
  title: string;
  image: string;
  quantity: number;
  price: number;
  seller: string;
}

export interface ShippingAddress extends Address {
  name: string;
  phone: string;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id: string;
  buyer: string | Pick<IUser, '_id' | 'name' | 'email'>;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: StatusHistory[];
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  product: string;
  user: Pick<IUser, '_id' | 'name' | 'avatar'> | string;
  order: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
  page?: number;
  limit?: number;
  seller?: string;
  tags?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}
