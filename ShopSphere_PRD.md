# ShopSphere — Product Requirements Document (PRD)
### Complete End-to-End MEAN Stack Multi-Vendor Marketplace
**Version:** 1.0.0  
**Date:** July 2026  
**Stack:** MongoDB · Express.js · Angular 21 · Node.js · TypeScript · Clerk · GSAP · Stripe (Test Mode)  
**Deployment:** Render (Free Tier) · Vercel (Free Tier)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Versions](#2-tech-stack--versions)
3. [Monorepo Folder Structure](#3-monorepo-folder-structure)
4. [Environment Variables](#4-environment-variables)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Data Models (Mongoose Schemas)](#6-data-models-mongoose-schemas)
7. [Backend API — All Endpoints](#7-backend-api--all-endpoints)
8. [Frontend — Pages & Components](#8-frontend--pages--components)
9. [Clerk Authentication](#9-clerk-authentication)
10. [GSAP + Angular Animations](#10-gsap--angular-animations)
11. [Stripe Payment Integration](#11-stripe-payment-integration)
12. [Socket.io — Real-Time Features](#12-socketio--real-time-features)
13. [Cloudinary — Image Uploads](#13-cloudinary--image-uploads)
14. [NgRx State Management](#14-ngrx-state-management)
15. [Angular Routing & Guards](#15-angular-routing--guards)
16. [HTTP Interceptors](#16-http-interceptors)
17. [Email Notifications](#17-email-notifications)
18. [Error Handling](#18-error-handling)
19. [Deployment Configuration](#19-deployment-configuration)
20. [Non-Functional Requirements](#20-non-functional-requirements)
21. [Claude Code Instructions](#21-claude-code-instructions)

---

## 1. Project Overview

**ShopSphere** is a fully-featured, multi-vendor e-commerce marketplace where:
- **Buyers** browse, search, cart, and purchase products from multiple sellers.
- **Sellers** list products, manage inventory, fulfill orders, and view sales analytics.
- **Admins** manage users, sellers, categories, and platform-wide settings.

### Goals
- Demonstrate a complete, production-grade MEAN stack application.
- Showcase Clerk auth, GSAP animations, Stripe payments, Socket.io real-time, and MongoDB aggregation pipelines.
- Deploy fully on free-tier cloud infrastructure (Render + Vercel).
- Serve as an impressive, recruiter-ready portfolio project.

---

## 2. Tech Stack & Versions

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Runtime |
| TypeScript | 5.x | Language |
| Express.js | 4.x | HTTP framework |
| Mongoose | 8.x | MongoDB ODM |
| @clerk/express | latest | Auth middleware |
| @clerk/backend | latest | Clerk server SDK |
| stripe | latest | Payments |
| socket.io | 4.x | Real-time events |
| cloudinary | 2.x | Image storage |
| multer | 1.x | File upload handling |
| nodemailer | 6.x | Email sending |
| zod | 3.x | Request validation |
| cors | 2.x | CORS middleware |
| helmet | 7.x | Security headers |
| morgan | 1.x | HTTP logging |
| dotenv | 16.x | Environment config |
| tsx | latest | TS execution in dev |
| ts-node | latest | TS execution |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Angular | 21.x | Frontend framework |
| TypeScript | 5.x | Language |
| @clerk/angular | latest | Clerk Angular SDK |
| @ngrx/store | latest | State management |
| @ngrx/effects | latest | Side effects |
| @ngrx/entity | latest | Entity collections |
| @ngrx/devtools | latest | Redux DevTools |
| @angular/material | latest | UI component library |
| gsap | 3.x | Animations |
| @gsap/ScrollTrigger | 3.x | Scroll animations |
| socket.io-client | 4.x | Real-time client |
| rxjs | 7.x | Reactive programming |

### Database
- **MongoDB Atlas** (Free M0 tier)

### External Services
- **Clerk** — Authentication (free tier)
- **Stripe** — Payments (test mode only)
- **Cloudinary** — Image storage (free tier)
- **Gmail SMTP** — Email via Nodemailer

---

## 3. Monorepo Folder Structure

```
shopsphere/
├── README.md
├── .gitignore
├── package.json                  # root (workspaces optional)
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                      # never commit
│   ├── .env.example
│   ├── src/
│   │   ├── server.ts             # entry point
│   │   ├── app.ts                # Express app setup
│   │   ├── config/
│   │   │   ├── db.ts             # MongoDB connection
│   │   │   ├── cloudinary.ts     # Cloudinary config
│   │   │   └── stripe.ts         # Stripe instance
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts      # Clerk token verify + role attach
│   │   │   ├── role.middleware.ts      # requireRole('seller') etc.
│   │   │   ├── error.middleware.ts     # Global error handler
│   │   │   ├── validate.middleware.ts  # Zod schema validator
│   │   │   └── upload.middleware.ts    # Multer config
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Product.model.ts
│   │   │   ├── Order.model.ts
│   │   │   ├── Cart.model.ts
│   │   │   ├── Review.model.ts
│   │   │   └── Category.model.ts
│   │   ├── routes/
│   │   │   ├── index.ts               # Mount all routers
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── review.routes.ts
│   │   │   ├── seller.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── payment.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── seller.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── payment.controller.ts
│   │   ├── services/
│   │   │   ├── email.service.ts
│   │   │   ├── cloudinary.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── sockets/
│   │   │   └── order.socket.ts        # Socket.io event handlers
│   │   ├── types/
│   │   │   └── index.ts               # Shared TS types/interfaces
│   │   └── utils/
│   │       ├── apiResponse.ts         # Standard response wrapper
│   │       ├── asyncHandler.ts        # Async error wrapper
│   │       └── pagination.ts          # Pagination helper
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── angular.json
    ├── .env                           # Angular environment
    ├── src/
    │   ├── main.ts                    # Bootstrap
    │   ├── app/
    │   │   ├── app.ts                 # Root component
    │   │   ├── app.config.ts          # provideRouter, provideStore etc.
    │   │   ├── app.routes.ts          # Top-level routes
    │   │   │
    │   │   ├── core/
    │   │   │   ├── guards/
    │   │   │   │   ├── auth.guard.ts
    │   │   │   │   ├── seller.guard.ts
    │   │   │   │   └── admin.guard.ts
    │   │   │   ├── interceptors/
    │   │   │   │   ├── auth.interceptor.ts    # Attach Clerk token
    │   │   │   │   └── error.interceptor.ts   # Global error handling
    │   │   │   └── services/
    │   │   │       ├── socket.service.ts
    │   │   │       └── animation.service.ts   # GSAP helpers
    │   │   │
    │   │   ├── store/
    │   │   │   ├── app.state.ts
    │   │   │   ├── cart/
    │   │   │   │   ├── cart.actions.ts
    │   │   │   │   ├── cart.reducer.ts
    │   │   │   │   ├── cart.effects.ts
    │   │   │   │   └── cart.selectors.ts
    │   │   │   ├── products/
    │   │   │   │   ├── product.actions.ts
    │   │   │   │   ├── product.reducer.ts
    │   │   │   │   ├── product.effects.ts
    │   │   │   │   └── product.selectors.ts
    │   │   │   └── orders/
    │   │   │       ├── order.actions.ts
    │   │   │       ├── order.reducer.ts
    │   │   │       ├── order.effects.ts
    │   │   │       └── order.selectors.ts
    │   │   │
    │   │   ├── shared/
    │   │   │   ├── components/
    │   │   │   │   ├── navbar/
    │   │   │   │   ├── footer/
    │   │   │   │   ├── product-card/
    │   │   │   │   ├── skeleton-loader/
    │   │   │   │   ├── star-rating/
    │   │   │   │   ├── toast/
    │   │   │   │   ├── breadcrumb/
    │   │   │   │   ├── pagination/
    │   │   │   │   └── confirm-dialog/
    │   │   │   ├── pipes/
    │   │   │   │   ├── currency-inr.pipe.ts
    │   │   │   │   └── truncate.pipe.ts
    │   │   │   └── models/
    │   │   │       └── index.ts               # Frontend interfaces
    │   │   │
    │   │   └── features/
    │   │       ├── home/
    │   │       ├── auth/
    │   │       ├── products/
    │   │       ├── cart/
    │   │       ├── checkout/
    │   │       ├── orders/
    │   │       ├── profile/
    │   │       ├── seller/
    │   │       └── admin/
    │   │
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.prod.ts
    │   └── styles/
    │       ├── styles.scss            # Global styles
    │       ├── _variables.scss        # Design tokens
    │       └── _animations.scss       # GSAP helper classes
```

---

## 4. Environment Variables

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopsphere

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=inr

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for CORS + Stripe redirect)
FRONTEND_URL=http://localhost:4200
```

### Frontend (`frontend/src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  wsUrl: 'http://localhost:5000',
  clerkPublishableKey: 'pk_test_...',
};
```

---

## 5. User Roles & Permissions

### Roles
| Role | Description |
|---|---|
| `buyer` | Default role. Can browse, cart, checkout, review. |
| `seller` | Can list products, manage inventory, view own orders and analytics. |
| `admin` | Full platform access — manage users, sellers, categories, all orders. |

### Role Storage
- Roles are stored in **Clerk `publicMetadata`**: `{ role: 'buyer' | 'seller' | 'admin' }`.
- When a new user signs up via Clerk webhook, a mirror `User` document is created in MongoDB with the Clerk `userId` as the primary reference.
- Role is read from Clerk metadata on every authenticated request via the backend middleware.

### Permission Matrix
| Action | Buyer | Seller | Admin |
|---|---|---|---|
| Browse products | ✅ | ✅ | ✅ |
| Add to cart | ✅ | ✅ | ❌ |
| Checkout | ✅ | ✅ | ❌ |
| Write reviews | ✅ | ✅ | ❌ |
| Create products | ❌ | ✅ (own) | ✅ |
| Edit products | ❌ | ✅ (own) | ✅ |
| Delete products | ❌ | ✅ (own) | ✅ |
| View seller dashboard | ❌ | ✅ (own) | ✅ |
| Manage all orders | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |
| View all analytics | ❌ | ❌ | ✅ |

---

## 6. Data Models (Mongoose Schemas)

### 6.1 User Model (`User.model.ts`)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;           // Clerk userId — primary auth reference
  name: string;
  email: string;
  avatar?: string;           // Cloudinary URL
  role: 'buyer' | 'seller' | 'admin';
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlist: mongoose.Types.ObjectId[];   // ref: Product
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId:  { type: String, required: true, unique: true, index: true },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, index: true },
  avatar:   { type: String },
  role:     { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  address: {
    street:  String,
    city:    String,
    state:   String,
    zip:     String,
    country: String,
  },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
```

### 6.2 Category Model (`Category.model.ts`)
```typescript
export interface ICategory extends Document {
  name: string;
  slug: string;              // URL-friendly, auto-generated
  image?: string;            // Cloudinary URL
  parent?: mongoose.Types.ObjectId;   // ref: Category (for subcategories)
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>({
  name:     { type: String, required: true, unique: true },
  slug:     { type: String, required: true, unique: true, index: true },
  image:    { type: String },
  parent:   { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
```

### 6.3 Product Model (`Product.model.ts`)
```typescript
export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;             // in paise (INR * 100) for Stripe compatibility
  discountPrice?: number;    // sale price in paise
  images: string[];          // Cloudinary URLs (max 5)
  category: mongoose.Types.ObjectId;   // ref: Category
  seller: mongoose.Types.ObjectId;     // ref: User (role: seller)
  stock: number;
  sku?: string;
  tags: string[];
  ratings: number;           // average, auto-recalculated
  numReviews: number;
  isActive: boolean;
  isFeatured: boolean;
}

const ProductSchema = new Schema<IProduct>({
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  images:        [{ type: String }],
  category:      { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  seller:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stock:         { type: Number, required: true, default: 0, min: 0 },
  sku:           { type: String },
  tags:          [{ type: String }],
  ratings:       { type: Number, default: 0, min: 0, max: 5 },
  numReviews:    { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
  isFeatured:    { type: Boolean, default: false },
}, { timestamps: true });

// Full-text search index
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Compound index for filtering
ProductSchema.index({ category: 1, price: 1, ratings: -1 });
ProductSchema.index({ seller: 1, isActive: 1 });
```

### 6.4 Cart Model (`Cart.model.ts`)
```typescript
export interface ICartItem {
  product: mongoose.Types.ObjectId;   // ref: Product
  quantity: number;
  priceAtAdd: number;        // price snapshot at time of adding
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;      // ref: User, unique
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  user:  { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product:    { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:   { type: Number, required: true, min: 1, default: 1 },
    priceAtAdd: { type: Number, required: true },
  }],
}, { timestamps: true });
```

### 6.5 Order Model (`Order.model.ts`)
```typescript
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;             // snapshot
  image: string;             // snapshot
  quantity: number;
  price: number;             // price at purchase in paise
  seller: mongoose.Types.ObjectId;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
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
}

const OrderSchema = new Schema<IOrder>({
  buyer:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items:   [{ /* as above */ }],
  shippingAddress: { /* as above */ },
  subtotal:    { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax:         { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus:          { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  stripeSessionId:        { type: String },
  stripePaymentIntentId:  { type: String },
  orderStatus:   { type: String, enum: ['placed','confirmed','shipped','out_for_delivery','delivered','cancelled','refunded'], default: 'placed' },
  statusHistory: [{ status: String, timestamp: Date, note: String }],
  trackingNumber: { type: String },
  notes:          { type: String },
}, { timestamps: true });

OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ 'items.seller': 1, orderStatus: 1 });
```

### 6.6 Review Model (`Review.model.ts`)
```typescript
export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;    // review only allowed after purchase
  rating: number;                    // 1–5
  title: string;
  comment: string;
  images?: string[];                 // optional review images
  isVerifiedPurchase: boolean;
}

const ReviewSchema = new Schema<IReview>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order:    { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    { type: String, required: true, maxlength: 100 },
  comment:  { type: String, required: true, maxlength: 1000 },
  images:   [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: true },
}, { timestamps: true });

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Post-save hook: recalculate product ratings
ReviewSchema.post('save', async function () {
  const stats = await Review.aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(this.product, {
    ratings: stats[0]?.avgRating?.toFixed(1) || 0,
    numReviews: stats[0]?.count || 0,
  });
});
```

---

## 7. Backend API — All Endpoints

**Base URL:** `/api`  
**Auth Header:** `Authorization: Bearer <clerk_session_token>`

### 7.1 Auth Routes (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/sync` | Clerk token | Sync Clerk user to MongoDB on first login |
| POST | `/auth/webhook` | Clerk signature | Clerk webhook: user.created, user.updated, user.deleted |
| GET | `/auth/me` | Any role | Get current user profile from MongoDB |

### 7.2 User Routes (`/api/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | Any | Get own profile |
| PUT | `/users/profile` | Any | Update name, avatar, address |
| GET | `/users/wishlist` | Buyer | Get wishlist with populated products |
| POST | `/users/wishlist/:productId` | Buyer | Add product to wishlist |
| DELETE | `/users/wishlist/:productId` | Buyer | Remove from wishlist |
| GET | `/users/orders` | Buyer | Get own order history (paginated) |

### 7.3 Category Routes (`/api/categories`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | Get all active categories (tree structure) |
| GET | `/categories/:slug` | Public | Get single category by slug |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Soft-delete category |

### 7.4 Product Routes (`/api/products`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List products (filter, search, sort, paginate) |
| GET | `/products/featured` | Public | Get featured products (homepage) |
| GET | `/products/:id` | Public | Get product detail with seller info |
| POST | `/products` | Seller/Admin | Create product (multipart/form-data with images) |
| PUT | `/products/:id` | Seller (own)/Admin | Update product |
| DELETE | `/products/:id` | Seller (own)/Admin | Soft-delete product |
| POST | `/products/:id/images` | Seller (own)/Admin | Upload additional images |
| DELETE | `/products/:id/images` | Seller (own)/Admin | Remove a product image |

**Query Params for GET `/products`:**
```
?search=laptop
&category=<categoryId>
&minPrice=500
&maxPrice=50000
&rating=4
&inStock=true
&sort=price_asc|price_desc|rating_desc|newest
&page=1
&limit=12
&seller=<sellerId>
&tags=electronics,gaming
```

### 7.5 Cart Routes (`/api/cart`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Buyer | Get cart with populated products |
| POST | `/cart/add` | Buyer | Add item to cart `{ productId, quantity }` |
| PUT | `/cart/item/:productId` | Buyer | Update quantity `{ quantity }` |
| DELETE | `/cart/item/:productId` | Buyer | Remove item from cart |
| DELETE | `/cart/clear` | Buyer | Clear entire cart |

### 7.6 Order Routes (`/api/orders`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/orders` | Buyer | Get own orders (paginated) |
| GET | `/orders/:id` | Buyer (own)/Admin | Get single order detail |
| PUT | `/orders/:id/cancel` | Buyer | Cancel order (only if status = 'placed') |
| GET | `/orders/admin/all` | Admin | Get all orders (paginated + filtered) |
| PUT | `/orders/admin/:id/status` | Admin | Update order status + emit socket event |

### 7.7 Payment Routes (`/api/payment`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payment/create-checkout-session` | Buyer | Create Stripe checkout session from cart |
| POST | `/payment/webhook` | Stripe signature | Handle Stripe events (payment_intent.succeeded etc.) |
| GET | `/payment/success` | Buyer | Verify payment and confirm order |

### 7.8 Review Routes (`/api/reviews`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews/product/:productId` | Public | Get reviews for a product (paginated) |
| POST | `/reviews` | Buyer | Create review `{ productId, orderId, rating, title, comment }` |
| PUT | `/reviews/:id` | Buyer (own) | Update own review |
| DELETE | `/reviews/:id` | Buyer (own)/Admin | Delete review |

### 7.9 Seller Routes (`/api/seller`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/seller/products` | Seller | Get own products (paginated) |
| GET | `/seller/orders` | Seller | Get orders containing own products |
| PUT | `/seller/orders/:id/status` | Seller | Update fulfillment status for own items |
| GET | `/seller/analytics/overview` | Seller | Total revenue, orders, products, avg rating |
| GET | `/seller/analytics/revenue` | Seller | Revenue over time (daily/weekly/monthly) |
| GET | `/seller/analytics/top-products` | Seller | Top 5 products by revenue |
| GET | `/seller/analytics/orders-by-status` | Seller | Order status breakdown |

### 7.10 Admin Routes (`/api/admin`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | Admin | Get all users (paginated + search) |
| PUT | `/admin/users/:id/role` | Admin | Change user role |
| PUT | `/admin/users/:id/status` | Admin | Activate/deactivate user |
| GET | `/admin/analytics/overview` | Admin | Platform-wide stats |
| GET | `/admin/analytics/revenue` | Admin | Platform revenue over time |
| GET | `/admin/products` | Admin | All products (including inactive) |
| PUT | `/admin/products/:id/featured` | Admin | Toggle featured status |

---

## 8. Frontend — Pages & Components

### 8.1 Pages

#### Public Pages
| Route | Component | Description |
|---|---|---|
| `/` | `HomeComponent` | Hero, featured products, category grid, promotional banners |
| `/products` | `ProductListComponent` | Grid with filters sidebar, search, sort, pagination |
| `/products/:id` | `ProductDetailComponent` | Images, description, reviews, add to cart |
| `/categories/:slug` | `CategoryComponent` | Products filtered by category |
| `/sign-in` | `SignInComponent` | Clerk `<clerk-sign-in>` wrapper |
| `/sign-up` | `SignUpComponent` | Clerk `<clerk-sign-up>` wrapper |

#### Buyer Pages (auth required)
| Route | Component | Description |
|---|---|---|
| `/cart` | `CartComponent` | Cart items, quantity update, subtotal, proceed to checkout |
| `/checkout` | `CheckoutComponent` | Shipping address form, Stripe redirect |
| `/checkout/success` | `CheckoutSuccessComponent` | Order confirmation animation |
| `/orders` | `OrderListComponent` | Order history with status timeline |
| `/orders/:id` | `OrderDetailComponent` | Full order detail + real-time tracking |
| `/wishlist` | `WishlistComponent` | Saved products grid |
| `/profile` | `ProfileComponent` | Edit name, address, avatar |

#### Seller Pages (seller role required)
| Route | Component | Description |
|---|---|---|
| `/seller/dashboard` | `SellerDashboardComponent` | Overview stats with animated counters |
| `/seller/products` | `SellerProductsComponent` | Product management table |
| `/seller/products/new` | `ProductFormComponent` | Create product form with image upload |
| `/seller/products/:id/edit` | `ProductFormComponent` | Edit product |
| `/seller/orders` | `SellerOrdersComponent` | Orders containing seller's products |
| `/seller/analytics` | `SellerAnalyticsComponent` | Revenue charts, top products |

#### Admin Pages (admin role required)
| Route | Component | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboardComponent` | Platform-wide metrics |
| `/admin/users` | `AdminUsersComponent` | User management table |
| `/admin/products` | `AdminProductsComponent` | All products management |
| `/admin/orders` | `AdminOrdersComponent` | All orders with status update |
| `/admin/categories` | `AdminCategoriesComponent` | Category CRUD |
| `/admin/analytics` | `AdminAnalyticsComponent` | Revenue, user growth charts |

### 8.2 Shared Components

#### `NavbarComponent`
- Logo, search bar, cart icon (badge with item count from NgRx), user menu.
- Shows "Seller Dashboard" and "Admin Panel" links based on role.
- Clerk `<clerk-user-button>` for profile/logout.
- Sticky with GSAP fade-in on scroll-up, hide on scroll-down.

#### `ProductCardComponent`
- Inputs: `product: IProduct`, `showSellerBadge: boolean`.
- Displays image, title, price (with discount), rating stars, stock badge.
- "Add to Cart" button with fly-to-cart GSAP animation on click.
- "Add to Wishlist" heart toggle.
- GSAP scroll-triggered entrance animation.

#### `SkeletonLoaderComponent`
- Input: `type: 'product-card' | 'product-detail' | 'order' | 'text'`.
- Shimmer animation via CSS, fades out when content loads.

#### `StarRatingComponent`
- Inputs: `rating: number`, `maxStars: number = 5`, `readonly: boolean`.
- Interactive (clickable) when `readonly = false`.

#### `ToastComponent`
- Global toast service using Angular CDK Overlay.
- Types: `success`, `error`, `info`, `warning`.
- GSAP slide-in from bottom-right.

#### `PaginationComponent`
- Inputs: `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`.
- Outputs: `pageChange: EventEmitter<number>`.

#### `BreadcrumbComponent`
- Auto-generated from active route.

#### `ConfirmDialogComponent`
- Angular Material dialog wrapper.
- Used for delete confirmations.

---

## 9. Clerk Authentication

### 9.1 Angular Setup (`app.config.ts`)
```typescript
import { provideClerk } from '@clerk/angular';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore(),
    provideEffects(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideClerk({ publishableKey: environment.clerkPublishableKey }),
    provideAnimations(),
  ],
};
```

### 9.2 Sign-In Page (`sign-in.component.ts`)
```typescript
@Component({
  standalone: true,
  template: `<clerk-sign-in [routing]="'path'" [path]="'/sign-in'" />`,
  imports: [ClerkSignIn],
})
export class SignInComponent {}
```

### 9.3 Backend Auth Middleware (`auth.middleware.ts`)
```typescript
import { clerkMiddleware, getAuth, clerkClient } from '@clerk/express';

// Apply globally in app.ts:
app.use(clerkMiddleware());

// Per-route auth check:
export const requireAuth = async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const clerkUser = await clerkClient.users.getUser(userId);
  req.userId = userId;
  req.clerkUser = clerkUser;
  req.role = (clerkUser.publicMetadata?.role as string) || 'buyer';
  next();
};

export const requireRole = (...roles: string[]) => (req, res, next) => {
  if (!roles.includes(req.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};
```

### 9.4 Clerk Webhook (`/api/auth/webhook`)
On `user.created`: Create MongoDB User document with `clerkId`, `name`, `email`, `role: 'buyer'`.  
On `user.updated`: Sync name, email, avatar.  
On `user.deleted`: Soft-delete (set `isActive: false`).  
Verify webhook signature using `svix` package.

### 9.5 Role Assignment Flow
1. New user signs up → Clerk creates user → Webhook fires → MongoDB User created with `role: 'buyer'`.
2. Admin upgrades user to seller via Admin Panel → API call to `PUT /admin/users/:id/role`.
3. Backend updates MongoDB User role AND calls `clerkClient.users.updateUserMetadata(clerkId, { publicMetadata: { role: 'seller' } })`.
4. User's next request reflects new role immediately.

---

## 10. GSAP + Angular Animations

### 10.1 GSAP AnimationService (`animation.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MotionPathPlugin from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

@Injectable({ providedIn: 'root' })
export class AnimationService {

  // Page entrance
  pageEnter(element: HTMLElement): void {
    gsap.fromTo(element,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  }

  // Staggered product cards
  staggerCards(selector: string): void {
    gsap.from(selector, {
      opacity: 0, y: 32, scale: 0.97,
      stagger: 0.07,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: selector, start: 'top 82%' },
    });
  }

  // Add to cart fly animation
  flyToCart(productImageEl: HTMLElement, cartIconEl: HTMLElement): void {
    const clone = productImageEl.cloneNode(true) as HTMLElement;
    const fromRect = productImageEl.getBoundingClientRect();
    const toRect = cartIconEl.getBoundingClientRect();
    clone.style.cssText = `
      position:fixed; top:${fromRect.top}px; left:${fromRect.left}px;
      width:${fromRect.width}px; height:${fromRect.height}px;
      border-radius:8px; z-index:9999; pointer-events:none; object-fit:cover;
    `;
    document.body.appendChild(clone);
    gsap.to(clone, {
      top: toRect.top, left: toRect.left,
      width: 24, height: 24,
      opacity: 0, duration: 0.65,
      ease: 'power2.in',
      onComplete: () => clone.remove(),
    });
  }

  // Counter animation (seller dashboard)
  animateCounter(element: HTMLElement, target: number, prefix = '', suffix = ''): void {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.6, ease: 'power1.out',
      onUpdate: () => {
        element.textContent = prefix + Math.round(obj.val).toLocaleString('en-IN') + suffix;
      },
    });
  }

  // Skeleton shimmer
  shimmer(selector: string): void {
    gsap.to(selector, { opacity: 0, duration: 0.3, stagger: 0.05 });
  }
}
```

### 10.2 Angular Animations (`_animations.ts` triggers file)
```typescript
import { trigger, transition, style, animate, state } from '@angular/animations';

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('250ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
  ]),
]);

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const expandCollapse = trigger('expandCollapse', [
  state('open',   style({ height: '*', opacity: 1 })),
  state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
  transition('open <=> closed', animate('300ms ease-in-out')),
]);

export const toastAnimation = trigger('toast', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.34,1.56,0.64,1)', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 })),
  ]),
]);
```

### 10.3 Where Each Animation Is Applied
| Animation | Location | Trigger |
|---|---|---|
| `pageEnter` | Every routed page | `ngAfterViewInit` |
| `staggerCards` | `ProductListComponent`, `HomeComponent` | `ngAfterViewInit` + ScrollTrigger |
| `flyToCart` | `ProductCardComponent`, `ProductDetailComponent` | "Add to Cart" button click |
| `animateCounter` | `SellerDashboardComponent`, `AdminDashboardComponent` | `ngAfterViewInit` |
| `slideInRight` | Cart drawer, mobile nav drawer | Angular `@trigger` on `*ngIf` |
| `fadeInUp` | Product detail sections | Angular `@trigger` on `*ngIf` |
| `expandCollapse` | Filter sidebar accordion, order status timeline | Angular `@trigger` on toggle |
| `toastAnimation` | `ToastComponent` | On toast push/dismiss |
| Navbar hide/show | `NavbarComponent` | GSAP + scroll event listener |
| Shimmer skeleton | `SkeletonLoaderComponent` | CSS keyframes (no GSAP needed) |

---

## 11. Stripe Payment Integration

### 11.1 Flow (Test Mode)
1. Buyer clicks "Proceed to Checkout" in cart.
2. Angular calls `POST /api/payment/create-checkout-session`.
3. Backend creates a Stripe Checkout Session with line items derived from cart.
4. Backend returns `{ sessionUrl }`.
5. Angular redirects to `sessionUrl` (Stripe-hosted checkout page).
6. On success, Stripe redirects to `FRONTEND_URL/checkout/success?session_id=xxx`.
7. Stripe fires `checkout.session.completed` webhook to `/api/payment/webhook`.
8. Backend webhook handler:
   - Verifies Stripe signature.
   - Creates Order document in MongoDB.
   - Updates `paymentStatus: 'paid'`.
   - Clears buyer's cart.
   - Sends order confirmation email.
   - Emits Socket.io event `order:new` to seller room.
9. `CheckoutSuccessComponent` shows animated confirmation.

### 11.2 Stripe Session Creation
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  currency: 'inr',
  line_items: cart.items.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.product.title,
        images: [item.product.images[0]],
        metadata: { productId: item.product._id.toString() },
      },
      unit_amount: item.product.price,   // in paise
    },
    quantity: item.quantity,
  })),
  metadata: {
    buyerId: req.userId,
    shippingAddress: JSON.stringify(shippingAddress),
  },
  success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/cart`,
});
```

### 11.3 Test Cards (Stripe Test Mode)
| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0025 0000 3155` | 3D Secure required |
- Expiry: any future date. CVV: any 3 digits.

---

## 12. Socket.io — Real-Time Features

### 12.1 Backend Setup (`server.ts`)
```typescript
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  // Buyer joins their personal room
  socket.on('join:buyer', (buyerId: string) => socket.join(`buyer:${buyerId}`));
  // Seller joins their room
  socket.on('join:seller', (sellerId: string) => socket.join(`seller:${sellerId}`));
  socket.on('disconnect', () => {});
});

export { io };
```

### 12.2 Events
| Event | Direction | Description |
|---|---|---|
| `join:buyer` | Client → Server | Buyer joins personal room |
| `join:seller` | Client → Server | Seller joins personal room |
| `order:new` | Server → Seller | New order placed containing seller's products |
| `order:status_updated` | Server → Buyer | Order status changed |
| `order:payment_confirmed` | Server → Buyer | Payment successfully processed |

### 12.3 Angular SocketService
```typescript
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket = io(environment.wsUrl);

  joinBuyerRoom(buyerId: string) { this.socket.emit('join:buyer', buyerId); }
  joinSellerRoom(sellerId: string) { this.socket.emit('join:seller', sellerId); }

  onOrderStatusUpdate(): Observable<{ orderId: string; status: string }> {
    return new Observable(observer => {
      this.socket.on('order:status_updated', data => observer.next(data));
    });
  }

  onNewOrder(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('order:new', data => observer.next(data));
    });
  }
}
```

---

## 13. Cloudinary — Image Uploads

### 13.1 Backend Upload Flow
```typescript
// multer stores in memory, then upload to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `shopsphere/${folder}`, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    ).end(file.buffer);
  });
};
```

### 13.2 Image Rules
- **Products:** max 5 images per product, 5MB each, formats: jpg/png/webp.
- **Avatars:** 1 image, 2MB max, auto-cropped to square.
- **Categories:** 1 image, 2MB max.
- **Reviews:** max 3 images, 3MB each.
- All images served via Cloudinary CDN with auto-format and quality optimization.

---

## 14. NgRx State Management

### 14.1 State Shape (`app.state.ts`)
```typescript
export interface AppState {
  cart:     CartState;
  products: ProductState;
  orders:   OrderState;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

interface ProductState {
  products: IProduct[];
  selectedProduct: IProduct | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

interface OrderState {
  orders: IOrder[];
  selectedOrder: IOrder | null;
  loading: boolean;
  error: string | null;
}
```

### 14.2 Cart Actions
```typescript
export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    'Load Cart':             emptyProps(),
    'Load Cart Success':     props<{ items: CartItem[] }>(),
    'Load Cart Failure':     props<{ error: string }>(),
    'Add Item':              props<{ productId: string; quantity: number }>(),
    'Add Item Success':      props<{ items: CartItem[] }>(),
    'Update Quantity':       props<{ productId: string; quantity: number }>(),
    'Update Quantity Success': props<{ items: CartItem[] }>(),
    'Remove Item':           props<{ productId: string }>(),
    'Remove Item Success':   props<{ items: CartItem[] }>(),
    'Clear Cart':            emptyProps(),
    'Clear Cart Success':    emptyProps(),
  },
});
```

### 14.3 Cart Selector (computed)
```typescript
export const selectCartTotal = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0)
);

export const selectCartCount = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);
```

---

## 15. Angular Routing & Guards

### 15.1 Routes (`app.routes.ts`)
```typescript
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component') },
  { path: 'products', loadComponent: () => import('./features/products/product-list.component') },
  { path: 'products/:id', loadComponent: () => import('./features/products/product-detail.component') },
  { path: 'sign-in', loadComponent: () => import('./features/auth/sign-in.component') },
  { path: 'sign-up', loadComponent: () => import('./features/auth/sign-up.component') },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'cart',     loadComponent: () => import('./features/cart/cart.component') },
      { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component') },
      { path: 'checkout/success', loadComponent: () => import('./features/checkout/checkout-success.component') },
      { path: 'orders',   loadComponent: () => import('./features/orders/order-list.component') },
      { path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail.component') },
      { path: 'wishlist', loadComponent: () => import('./features/profile/wishlist.component') },
      { path: 'profile',  loadComponent: () => import('./features/profile/profile.component') },
    ],
  },
  {
    path: 'seller',
    canActivate: [authGuard, sellerGuard],
    children: [
      { path: 'dashboard',          loadComponent: () => import('./features/seller/seller-dashboard.component') },
      { path: 'products',           loadComponent: () => import('./features/seller/seller-products.component') },
      { path: 'products/new',       loadComponent: () => import('./features/seller/product-form.component') },
      { path: 'products/:id/edit',  loadComponent: () => import('./features/seller/product-form.component') },
      { path: 'orders',             loadComponent: () => import('./features/seller/seller-orders.component') },
      { path: 'analytics',          loadComponent: () => import('./features/seller/seller-analytics.component') },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard',  loadComponent: () => import('./features/admin/admin-dashboard.component') },
      { path: 'users',      loadComponent: () => import('./features/admin/admin-users.component') },
      { path: 'products',   loadComponent: () => import('./features/admin/admin-products.component') },
      { path: 'orders',     loadComponent: () => import('./features/admin/admin-orders.component') },
      { path: 'categories', loadComponent: () => import('./features/admin/admin-categories.component') },
      { path: 'analytics',  loadComponent: () => import('./features/admin/admin-analytics.component') },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

### 15.2 Guards
```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const clerk = inject(ClerkService);
  const router = inject(Router);
  return clerk.isSignedIn() ? true : router.parseUrl('/sign-in');
};

// seller.guard.ts — reads role from Clerk session claims
export const sellerGuard: CanActivateFn = async () => {
  const clerk = inject(ClerkService);
  const router = inject(Router);
  const token = await clerk.session?.getToken({ template: 'default' });
  const role = clerk.user?.publicMetadata?.['role'];
  return ['seller', 'admin'].includes(role as string) ? true : router.parseUrl('/');
};

// admin.guard.ts
export const adminGuard: CanActivateFn = async () => {
  const clerk = inject(ClerkService);
  const router = inject(Router);
  const role = clerk.user?.publicMetadata?.['role'];
  return role === 'admin' ? true : router.parseUrl('/');
};
```

---

## 16. HTTP Interceptors

### 16.1 Auth Interceptor (`auth.interceptor.ts`)
Attaches Clerk session token as `Authorization: Bearer <token>` on every outgoing API request.
```typescript
export const authInterceptor: HttpInterceptorFn = async (req, next) => {
  const clerk = inject(ClerkService);
  if (!clerk.isSignedIn()) return next(req);
  const token = await clerk.session?.getToken();
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(authReq);
};
```

### 16.2 Error Interceptor (`error.interceptor.ts`)
- **401:** Redirect to `/sign-in`.
- **403:** Redirect to `/` with toast "Access denied".
- **500:** Show global error toast.
- **Network error:** Show "Connection lost" toast.

---

## 17. Email Notifications

### Triggered Emails (via Nodemailer + Gmail SMTP)
| Trigger | Recipient | Subject |
|---|---|---|
| Order placed (payment confirmed) | Buyer | "Your ShopSphere order #XXXX is confirmed!" |
| Order status → Shipped | Buyer | "Your order is on its way! 🚚" |
| Order status → Delivered | Buyer | "Your order has been delivered!" |
| New order (seller's product sold) | Seller | "You have a new order on ShopSphere!" |
| Order cancelled | Buyer | "Your order has been cancelled" |

All emails use HTML templates stored in `backend/src/templates/` as `.html` files with `{{placeholder}}` variable interpolation.

---

## 18. Error Handling

### 18.1 Backend — Standard API Response
```typescript
// utils/apiResponse.ts
export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public meta?: { page: number; limit: number; total: number; totalPages: number }
  ) {}
}

// utils/asyncHandler.ts
export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Global error middleware
export const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json(new ApiResponse(false, err.message || 'Internal Server Error'));
};
```

### 18.2 Frontend — Error States
- Every NgRx effect catches errors and dispatches failure actions.
- `ErrorInterceptor` handles HTTP-level errors globally.
- Components show inline error messages using Angular Material snackbar / custom toast.
- Empty states with illustration for: no products found, empty cart, no orders yet.

---

## 19. Deployment Configuration

### 19.1 Backend — Render (Free Tier)

**`render.yaml`** (in `backend/`):
```yaml
services:
  - type: web
    name: shopsphere-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      # All other env vars added manually in Render dashboard
```

**`backend/package.json` scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
  }
}
```

**`backend/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Important Render free-tier notes:**
- Free tier spins down after 15 minutes of inactivity (cold start ~30s).
- Add a ping service (UptimeRobot free tier) to keep it warm during demo.
- MongoDB Atlas free tier: whitelist `0.0.0.0/0` for Render's dynamic IPs.

### 19.2 Frontend — Vercel (Free Tier)

**`vercel.json`** (in `frontend/`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**`frontend/package.json` scripts:**
```json
{
  "scripts": {
    "build": "ng build --configuration production",
    "start": "ng serve"
  }
}
```

**Environment on Vercel:** Set `VITE_` / Angular environment variables in Vercel dashboard under Project Settings → Environment Variables.

### 19.3 CORS Configuration (Backend)
```typescript
app.use(cors({
  origin: [process.env.FRONTEND_URL!, 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 19.4 Stripe Webhook on Render
Configure Stripe Dashboard webhook endpoint:
```
https://shopsphere-backend.onrender.com/api/payment/webhook
```
Events to listen for: `checkout.session.completed`, `payment_intent.payment_failed`.

### 19.5 Clerk Webhook on Render
Configure Clerk Dashboard webhook endpoint:
```
https://shopsphere-backend.onrender.com/api/auth/webhook
```
Events: `user.created`, `user.updated`, `user.deleted`.

---

## 20. Non-Functional Requirements

### Performance
- Angular lazy-loaded routes — initial bundle under 200KB gzipped.
- Mongoose queries use indexes; no unindexed queries on collections > 1000 docs.
- Cloudinary auto-format + quality optimization on all images.
- API responses paginated (default 12 items/page, max 48).

### Security
- Helmet.js security headers on all responses.
- All mutations protected by `requireAuth` middleware.
- Stripe webhook signature verification (`stripe.webhooks.constructEvent`).
- Clerk webhook signature verification (`svix`).
- Zod validation on all request bodies.
- No sensitive data (keys, passwords) in frontend code or git history.
- MongoDB: use `lean()` for read-only queries. Never return `password` fields (none stored — Clerk handles it).

### Code Quality
- TypeScript strict mode throughout (`strict: true`).
- ESLint + Prettier configured.
- All API endpoints return consistent `ApiResponse` shape.
- All async Express handlers wrapped in `asyncHandler`.
- No `any` types — define interfaces for all data shapes.

### Accessibility
- Angular Material components are ARIA-compliant by default.
- All images have descriptive `alt` attributes.
- Keyboard-navigable product cards and forms.
- Color contrast meets WCAG AA.

---

## 21. Claude Code Instructions

> **Read this section carefully before generating any code.**

### General Instructions
1. Build the backend first, then the frontend. Do not mix concerns.
2. Use **TypeScript strict mode** in both backend and frontend. No `any` types.
3. Use **standalone Angular components** throughout — no NgModules.
4. Every backend route must use the `asyncHandler` wrapper — no unhandled promise rejections.
5. Every API response must use the `ApiResponse` class for consistency.
6. Use **Zod** for all request body validation in the backend.
7. Install all packages before writing code that imports them.

### Build Order
```
Step 1: Create monorepo root structure
Step 2: Backend — package.json, tsconfig, .env.example
Step 3: Backend — db.ts, app.ts, server.ts (bare skeleton)
Step 4: Backend — all Mongoose models
Step 5: Backend — middlewares (auth, role, error, validate, upload)
Step 6: Backend — utilities (apiResponse, asyncHandler, pagination)
Step 7: Backend — all controllers (empty stubs first, then implement)
Step 8: Backend — all routes (wire controllers)
Step 9: Backend — services (email, cloudinary, analytics)
Step 10: Backend — socket handlers
Step 11: Frontend — Angular project scaffold (ng new with standalone)
Step 12: Frontend — install all dependencies
Step 13: Frontend — app.config.ts with all providers
Step 14: Frontend — NgRx store (state, actions, reducers, effects, selectors)
Step 15: Frontend — core (guards, interceptors, services)
Step 16: Frontend — shared components (navbar, product-card, skeleton, toast, etc.)
Step 17: Frontend — feature modules (home, products, cart, checkout, orders, profile)
Step 18: Frontend — seller feature
Step 19: Frontend — admin feature
Step 20: Frontend — GSAP animation service + wire animations to components
Step 21: Deployment configs (render.yaml, vercel.json)
Step 22: README.md with setup instructions
```

### Critical Implementation Details
- **Clerk Angular SDK:** Use `@clerk/angular` — wrap `<clerk-sign-in>` and `<clerk-sign-up>` in standalone components. Use `ClerkService` for `isSignedIn()`, `user`, and `session.getToken()` throughout.
- **Stripe redirect flow:** Do NOT use Stripe Elements embedded — use Stripe-hosted Checkout (redirect flow) for simplicity and security.
- **Socket.io:** Initialize the Socket.io server in `server.ts` and export the `io` instance. Import it in controllers that need to emit events (order controller).
- **GSAP:** Install `gsap` package. Register `ScrollTrigger` and `MotionPathPlugin` once in `AnimationService` constructor. Call GSAP methods in `ngAfterViewInit`, never `ngOnInit` (DOM not ready).
- **MongoDB Atlas:** Connection string uses `mongoose.connect()` in `config/db.ts`. Always handle connection errors gracefully.
- **Image uploads:** Use `multer` with `memoryStorage()` (no disk writes — Render free tier has ephemeral filesystem). Stream directly from memory to Cloudinary.
- **Pagination:** All list endpoints accept `?page=1&limit=12`. Return `{ data, meta: { page, limit, total, totalPages } }`.
- **Price handling:** Store all prices in **paise** (INR × 100) as integers in MongoDB. Display by dividing by 100 in the frontend pipe.
- **Angular Material Theme:** Use a custom theme with primary color `#6C63FF` (indigo-purple) and accent `#FF6584` (coral-pink).
- **Environment files:** Never hardcode API URLs. Always read from `environment.ts`.
- **Error boundaries:** Every NgRx effect must have a `catchError` that dispatches a failure action and returns `EMPTY`.

### README.md Must Include
1. Project overview + screenshots placeholder
2. Full local development setup (clone → install → env vars → run)
3. All required environment variables with descriptions
4. How to create a Clerk app and get keys
5. How to set up MongoDB Atlas free cluster
6. How to set up Cloudinary account
7. How to configure Stripe test mode
8. Deployment steps for Render + Vercel
9. Test card numbers for Stripe
10. How to promote a user to seller/admin via Clerk dashboard

---

*End of PRD — ShopSphere v1.0.0*
*Generated for use with Claude Code. All specifications are complete and implementation-ready.*
