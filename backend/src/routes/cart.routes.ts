import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';

export const cartRouter = Router();

// Buyers (and sellers, who may also shop). Admins cannot use the cart per the matrix.
cartRouter.use(requireAuth, requireRole('buyer', 'seller'));

cartRouter.get('/', asyncHandler(getCart));
cartRouter.post('/add', asyncHandler(addToCart));
cartRouter.put('/item/:productId', asyncHandler(updateCartItem));
cartRouter.delete('/item/:productId', asyncHandler(removeCartItem));
cartRouter.delete('/clear', asyncHandler(clearCart));
