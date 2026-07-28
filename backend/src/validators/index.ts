import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// ── User / Profile ────────────────────────────────────────
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  avatar: z.string().url().optional(),
  address: addressSchema.optional(),
});

// ── Category ──────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(1).max(80),
  image: z.string().url().optional(),
  parent: objectId.nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ── Product ───────────────────────────────────────────────
export const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.coerce.number().int().min(0), // paise
  discountPrice: z.coerce.number().int().min(0).optional(),
  category: objectId,
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? v.split(',').map((t) => t.trim()).filter(Boolean) : (v ?? []))),
  isFeatured: z.coerce.boolean().optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.coerce.number().int().min(0).optional(),
  discountPrice: z.coerce.number().int().min(0).optional(),
  category: objectId.optional(),
  stock: z.coerce.number().int().min(0).optional(),
  sku: z.string().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : typeof v === 'string' ? v.split(',').map((t) => t.trim()).filter(Boolean) : v,
    ),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: objectId.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
  seller: objectId.optional(),
  tags: z.string().optional(),
});

// ── Cart ──────────────────────────────────────────────────
export const addToCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

// ── Order ─────────────────────────────────────────────────
export const shippingAddressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(5),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

export const orderStatusSchema = z.object({
  status: z.enum([
    'placed',
    'confirmed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded',
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
});

// ── Review ────────────────────────────────────────────────
export const createReviewSchema = z.object({
  productId: objectId,
  orderId: objectId,
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(1).max(1000),
});

export const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(1).max(1000).optional(),
});

// ── Admin ─────────────────────────────────────────────────
export const changeRoleSchema = z.object({
  role: z.enum(['buyer', 'seller', 'admin']),
});

export const changeStatusSchema = z.object({
  isActive: z.coerce.boolean(),
});
