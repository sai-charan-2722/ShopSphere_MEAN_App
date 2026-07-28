import type { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import type { Role } from '../types';

/**
 * Verifies the Clerk session and attaches identity + role to the request.
 * `clerkMiddleware()` (mounted globally in app.ts) must run before this.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    req.userId = userId;
    req.clerkUser = clerkUser;
    req.role = ((clerkUser.publicMetadata?.role as Role | undefined) ?? 'buyer') as Role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Lightweight auth that only reads the userId from the Clerk session claims
 * without a round-trip to Clerk. Role is read from session token metadata
 * when available, else defaults to buyer. Useful for high-frequency endpoints.
 */
export const requireAuthFast = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  req.userId = userId;
  const metaRole = (sessionClaims?.metadata as { role?: Role } | undefined)?.role;
  req.role = metaRole ?? 'buyer';
  next();
};
