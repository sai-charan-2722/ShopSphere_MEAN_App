import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';

import { env } from './config/env';
import { apiRouter } from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

export function createApp(): Application {
  const app = express();

  // ── Security & logging ────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: [env.frontendUrl, 'http://localhost:4200'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // ── Raw body for webhooks (MUST come before express.json) ──
  // Stripe & Clerk verify signatures against the raw request body.
  app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
  app.use('/api/auth/webhook', express.raw({ type: 'application/json' }));

  // ── JSON body parser for everything else ──────────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Clerk auth context on every request ───────────────
  app.use(clerkMiddleware());

  // ── Health check ──────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'shopsphere-backend', time: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── 404 + global error handler ────────────────────────
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
