import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  getSellerProducts,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerOverview,
  getSellerRevenue,
  getSellerTopProducts,
  getSellerOrdersByStatus,
} from '../controllers/seller.controller';

export const sellerRouter = Router();

sellerRouter.use(requireAuth, requireRole('seller', 'admin'));

sellerRouter.get('/products', asyncHandler(getSellerProducts));
sellerRouter.get('/orders', asyncHandler(getSellerOrders));
sellerRouter.put('/orders/:id/status', asyncHandler(updateSellerOrderStatus));

sellerRouter.get('/analytics/overview', asyncHandler(getSellerOverview));
sellerRouter.get('/analytics/revenue', asyncHandler(getSellerRevenue));
sellerRouter.get('/analytics/top-products', asyncHandler(getSellerTopProducts));
sellerRouter.get('/analytics/orders-by-status', asyncHandler(getSellerOrdersByStatus));
