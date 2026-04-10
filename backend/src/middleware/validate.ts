import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type Target = 'body' | 'query' | 'params';

export const validate =
  <T, K extends Target = 'body'>(
    schema: ZodSchema<T>,
    target?: K,
  ): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const resolved = target || 'body';
    const data = req[resolved] as unknown;
    const result = schema.safeParse(data);

    if (!result.success) {
      return next(new AppError('Validation failed', 400));
    }

    if (resolved === 'query' || resolved === 'params') {
      Object.assign(req[resolved], result.data);
    } else {
      req.body = result.data;
    }

    next();
  };
