import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, typed access to environment variables.
 * Fails fast (in production) when a required variable is missing.
 */
function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    // In dev we allow missing values so the server can still boot for partial testing.
    console.warn(`[env] Warning: environment variable "${key}" is not set.`);
    return '';
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',

  mongoUri: required('MONGODB_URI'),

  clerk: {
    publishableKey: required('CLERK_PUBLISHABLE_KEY'),
    secretKey: required('CLERK_SECRET_KEY'),
    webhookSecret: required('CLERK_WEBHOOK_SECRET'),
  },

  stripe: {
    secretKey: required('STRIPE_SECRET_KEY'),
    webhookSecret: required('STRIPE_WEBHOOK_SECRET'),
    currency: process.env.STRIPE_CURRENCY ?? 'inr',
  },

  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey: required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },

  email: {
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
    user: required('EMAIL_USER'),
    pass: required('EMAIL_PASS'),
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? 'ShopSphere <no-reply@shopsphere.dev>',
  },

  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
};
