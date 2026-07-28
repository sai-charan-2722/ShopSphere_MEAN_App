import type { Request, Response } from 'express';
import mongoose, { type FilterQuery } from 'mongoose';
import { z } from 'zod';
import { Product, type IProduct } from '../models/Product.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination, buildMeta } from '../utils/pagination';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators';
import { uploadManyToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { HttpError } from '../types';

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** GET /api/products — public list with filters, search, sort, pagination. */
export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const q = productQuerySchema.parse(req.query);
  const { page, limit, skip } = parsePagination({ page: q.page, limit: q.limit });

  const filter: FilterQuery<IProduct> = { isActive: true };

  if (q.search) filter.$text = { $search: q.search };
  if (q.category) filter.category = new mongoose.Types.ObjectId(q.category);
  if (q.seller) filter.seller = new mongoose.Types.ObjectId(q.seller);
  if (q.rating !== undefined) filter.ratings = { $gte: q.rating };
  if (q.inStock === true) filter.stock = { $gt: 0 };
  if (q.tags) filter.tags = { $in: q.tags.split(',').map((t) => t.trim()).filter(Boolean) };

  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    filter.price = {};
    if (q.minPrice !== undefined) filter.price.$gte = q.minPrice;
    if (q.maxPrice !== undefined) filter.price.$lte = q.maxPrice;
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (q.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'rating_desc':
      sort = { ratings: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('seller', 'name avatar')
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json(ApiResponse.ok(products, 'Products fetched', buildMeta(page, limit, total)));
};

/** GET /api/products/featured */
export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .sort({ ratings: -1, createdAt: -1 })
    .limit(12)
    .populate('category', 'name slug')
    .populate('seller', 'name avatar')
    .lean();
  res.json(ApiResponse.ok(products));
};

/** GET /api/products/:id */
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const product = await Product.findOne({ _id: id, isActive: true })
    .populate('category', 'name slug')
    .populate('seller', 'name avatar email')
    .lean();
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(ApiResponse.ok(product));
};

/** POST /api/products — seller/admin (multipart with images). */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const dto = createProductSchema.parse(req.body);
  const user = await getCurrentUser(req);

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, 'At least one product image is required');
  const images = await uploadManyToCloudinary(files, 'products');

  const product = await Product.create({
    ...dto,
    images,
    seller: user._id,
  });

  res.status(201).json(ApiResponse.ok(product, 'Product created'));
};

/** Ensure the caller owns the product (or is admin). Returns the product. */
async function loadOwnedProduct(req: Request, id: string): Promise<IProduct> {
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found');

  if (req.role !== 'admin') {
    const user = await getCurrentUser(req);
    if (String(product.seller) !== String(user._id)) {
      throw new HttpError(403, 'You can only modify your own products');
    }
  }
  return product;
}

/** PUT /api/products/:id — seller(own)/admin. */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const dto = updateProductSchema.parse(req.body);
  const product = await loadOwnedProduct(req, id);

  Object.assign(product, dto);
  await product.save();

  res.json(ApiResponse.ok(product, 'Product updated'));
};

/** DELETE /api/products/:id — seller(own)/admin soft-delete. */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const product = await loadOwnedProduct(req, id);
  product.isActive = false;
  await product.save();
  res.json(ApiResponse.ok(null, 'Product deleted'));
};

/** POST /api/products/:id/images — add images (max 5 total). */
export const addProductImages = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const product = await loadOwnedProduct(req, id);

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, 'No images provided');
  if (product.images.length + files.length > 5) {
    throw new HttpError(400, 'A product can have at most 5 images');
  }

  const uploaded = await uploadManyToCloudinary(files, 'products');
  product.images.push(...uploaded);
  await product.save();

  res.json(ApiResponse.ok(product.images, 'Images added'));
};

/** DELETE /api/products/:id/images — remove one image by URL. */
export const removeProductImage = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const { imageUrl } = z.object({ imageUrl: z.string().url() }).parse(req.body);
  const product = await loadOwnedProduct(req, id);

  if (!product.images.includes(imageUrl)) throw new HttpError(404, 'Image not found on product');

  product.images = product.images.filter((img) => img !== imageUrl);
  await product.save();
  await deleteFromCloudinary(imageUrl);

  res.json(ApiResponse.ok(product.images, 'Image removed'));
};
