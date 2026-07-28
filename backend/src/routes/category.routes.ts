import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadCategoryImage } from '../middlewares/upload.middleware';
import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';

export const categoryRouter = Router();

// Public
categoryRouter.get('/', asyncHandler(listCategories));
categoryRouter.get('/:slug', asyncHandler(getCategoryBySlug));

// Admin
categoryRouter.post('/', requireAuth, requireRole('admin'), uploadCategoryImage, asyncHandler(createCategory));
categoryRouter.put('/:id', requireAuth, requireRole('admin'), uploadCategoryImage, asyncHandler(updateCategory));
categoryRouter.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(deleteCategory));
