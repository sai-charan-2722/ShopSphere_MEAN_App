import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validates a request segment against a Zod schema and replaces it with the
 * parsed (typed, coerced) result. Throws ZodError → handled by errorMiddleware.
 */
export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[target]);
    // query/params are getters on some Express versions — assign defensively
    (req as unknown as Record<string, unknown>)[target] = parsed;
    next();
  };
