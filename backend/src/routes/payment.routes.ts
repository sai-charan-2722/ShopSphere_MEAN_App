import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { createCheckoutSession, stripeWebhook, verifyPayment } from '../controllers/payment.controller';

export const paymentRouter = Router();

// Stripe webhook — no auth (verified via Stripe signature), raw body set in app.ts
paymentRouter.post('/webhook', asyncHandler(stripeWebhook));

paymentRouter.post(
  '/create-checkout-session',
  requireAuth,
  requireRole('buyer', 'seller'),
  asyncHandler(createCheckoutSession),
);
paymentRouter.get('/success', requireAuth, asyncHandler(verifyPayment));
