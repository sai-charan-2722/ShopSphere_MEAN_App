import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../types';

/**
 * Restricts a route to the given roles. Must run after `requireAuth`.
 * Usage: router.post('/', requireAuth, requireRole('seller', 'admin'), handler)
 */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.role || !roles.includes(req.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
