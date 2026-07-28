import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadProductImages } from '../middlewares/upload.middleware';
import {
  listProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
} from '../controllers/product.controller';

export const productRouter = Router();

// Public
productRouter.get('/', asyncHandler(listProducts));
productRouter.get('/featured', asyncHandler(getFeaturedProducts));
productRouter.get('/:id', asyncHandler(getProduct));

// Seller / Admin
productRouter.post('/', requireAuth, requireRole('seller', 'admin'), uploadProductImages, asyncHandler(createProduct));
productRouter.put('/:id', requireAuth, requireRole('seller', 'admin'), asyncHandler(updateProduct));
productRouter.delete('/:id', requireAuth, requireRole('seller', 'admin'), asyncHandler(deleteProduct));
productRouter.post(
  '/:id/images',
  requireAuth,
  requireRole('seller', 'admin'),
  uploadProductImages,
  asyncHandler(addProductImages),
);
productRouter.delete('/:id/images', requireAuth, requireRole('seller', 'admin'), asyncHandler(removeProductImage));
