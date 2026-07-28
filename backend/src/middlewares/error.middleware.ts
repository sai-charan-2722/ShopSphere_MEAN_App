import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';
import { HttpError } from '../types';

/** 404 handler for unmatched routes. */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json(ApiResponse.fail(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler. Normalises Zod, Mongoose and HttpError instances
 * into the standard ApiResponse shape.
 */
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    res.status(400).json(ApiResponse.fail(message || 'Validation failed'));
    return;
  }

  // Explicit HTTP errors
  if (err instanceof HttpError) {
    res.status(err.status).json(ApiResponse.fail(err.message));
    return;
  }

  // Mongoose cast errors (e.g. invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json(ApiResponse.fail(`Invalid ${err.path}: ${String(err.value)}`));
    return;
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    res.status(400).json(ApiResponse.fail(message));
    return;
  }

  // Mongo duplicate key
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {})[0];
    res.status(409).json(ApiResponse.fail(`Duplicate value for field: ${field ?? 'unknown'}`));
    return;
  }

  const status = (err as { status?: number }).status ?? 500;
  const message = (err as { message?: string }).message ?? 'Internal Server Error';

  if (status >= 500) {
    console.error('❌ Unhandled error:', err);
  }

  res.status(status).json(ApiResponse.fail(message));
};
