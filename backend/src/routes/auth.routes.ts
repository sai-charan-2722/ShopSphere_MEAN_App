import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { syncUser, getMe, clerkWebhook } from '../controllers/auth.controller';

export const authRouter = Router();

// Clerk webhook — no auth (verified via svix signature), raw body set in app.ts
authRouter.post('/webhook', asyncHandler(clerkWebhook));

authRouter.post('/sync', requireAuth, asyncHandler(syncUser));
authRouter.get('/me', requireAuth, asyncHandler(getMe));
