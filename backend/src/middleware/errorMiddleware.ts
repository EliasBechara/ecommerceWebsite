/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message:
      isProduction && statusCode === 500
        ? 'Internal Server Error'
        : err.message,
    ...(err.details && { details: err.details }),
    ...(!isProduction && { stack: err.stack }),
  });
};