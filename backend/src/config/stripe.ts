import Stripe from 'stripe';
import { env } from './env';

/**
 * Shared Stripe instance (test mode).
 * Uses the account's default API version pinned by the installed SDK.
 */
// Omit apiVersion so the SDK uses the account's pinned version.
export const stripe = new Stripe(env.stripe.secretKey, {
  typescript: true,
});
