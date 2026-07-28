import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  getUsers,
  changeUserRole,
  changeUserStatus,
  getAdminOverview,
  getAdminRevenue,
  getAllProducts,
  toggleFeatured,
} from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/users', asyncHandler(getUsers));
adminRouter.put('/users/:id/role', asyncHandler(changeUserRole));
adminRouter.put('/users/:id/status', asyncHandler(changeUserStatus));

adminRouter.get('/analytics/overview', asyncHandler(getAdminOverview));
adminRouter.get('/analytics/revenue', asyncHandler(getAdminRevenue));

adminRouter.get('/products', asyncHandler(getAllProducts));
adminRouter.put('/products/:id/featured', asyncHandler(toggleFeatured));
