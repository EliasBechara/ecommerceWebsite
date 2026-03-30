import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type Target = 'body' | 'query' | 'params';

// Generic middleware: T is the shape of the schema
export const validate =
  <T, K extends Target = 'body'>(
    schema: ZodSchema<T>,
    target?: K,
  ): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = req[target || 'body'] as unknown;
    const result = schema.safeParse(data);

    if (!result.success) {
      return next(new AppError('Validation failed', 400));
    }

    // Overwrite the target with properly typed data
    req[target || 'body'] = result.data;

    next();
  };
