import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  (error as AppError).statusCode = 404;
  next(error);
};
