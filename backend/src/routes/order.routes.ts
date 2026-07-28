import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  getMyOrders,
  getOrder,
  cancelOrder,
  adminGetAllOrders,
  adminUpdateOrderStatus,
} from '../controllers/order.controller';

export const orderRouter = Router();

orderRouter.use(requireAuth);

// Admin routes first (more specific paths before '/:id')
orderRouter.get('/admin/all', requireRole('admin'), asyncHandler(adminGetAllOrders));
orderRouter.put('/admin/:id/status', requireRole('admin'), asyncHandler(adminUpdateOrderStatus));

// Buyer
orderRouter.get('/', requireRole('buyer', 'seller'), asyncHandler(getMyOrders));
orderRouter.get('/:id', asyncHandler(getOrder));
orderRouter.put('/:id/cancel', requireRole('buyer', 'seller'), asyncHandler(cancelOrder));
