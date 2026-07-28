import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Category } from '../models/Category.model';
import { Product } from '../models/Product.model';
import { ApiResponse } from '../utils/apiResponse';
import { slugify } from '../utils/slug';
import { createCategorySchema, updateCategorySchema } from '../validators';
import { HttpError } from '../types';
import { uploadToCloudinary } from '../services/cloudinary.service';

const idParam = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/** GET /api/categories — all active categories as a tree. */
export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();

  // Build a simple two-level tree (parent → children).
  const byId = new Map(categories.map((c) => [String(c._id), { ...c, children: [] as unknown[] }]));
  const roots: unknown[] = [];
  for (const cat of byId.values()) {
    if (cat.parent && byId.has(String(cat.parent))) {
      (byId.get(String(cat.parent))!.children as unknown[]).push(cat);
    } else {
      roots.push(cat);
    }
  }

  res.json(ApiResponse.ok(roots));
};

/** GET /api/categories/:slug */
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!category) throw new HttpError(404, 'Category not found');
  res.json(ApiResponse.ok(category));
};

/** POST /api/categories — admin. */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const dto = createCategorySchema.parse(req.body);

  let image = dto.image;
  if (req.file) image = await uploadToCloudinary(req.file, 'categories');

  const category = await Category.create({
    name: dto.name,
    slug: slugify(dto.name),
    image,
    parent: dto.parent ?? null,
  });

  res.status(201).json(ApiResponse.ok(category, 'Category created'));
};

/** PUT /api/categories/:id — admin. */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);
  const dto = updateCategorySchema.parse(req.body);

  const category = await Category.findById(id);
  if (!category) throw new HttpError(404, 'Category not found');

  if (dto.name !== undefined) {
    category.name = dto.name;
    category.slug = slugify(dto.name);
  }
  if (dto.parent !== undefined) {
    category.parent = dto.parent ? new mongoose.Types.ObjectId(dto.parent) : null;
  }
  if (req.file) category.image = await uploadToCloudinary(req.file, 'categories');
  else if (dto.image !== undefined) category.image = dto.image;

  await category.save();
  res.json(ApiResponse.ok(category, 'Category updated'));
};

/** DELETE /api/categories/:id — admin soft-delete. */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParam.parse(req.params);

  const inUse = await Product.countDocuments({ category: id, isActive: true });
  if (inUse > 0) {
    throw new HttpError(409, `Cannot delete: ${inUse} active product(s) use this category`);
  }

  const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!category) throw new HttpError(404, 'Category not found');
  res.json(ApiResponse.ok(null, 'Category deleted'));
};
