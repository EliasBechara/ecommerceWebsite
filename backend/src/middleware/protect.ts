import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

declare module 'express' {
  interface Request {
    user?: string | JwtPayload;
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET missing');
  }

  const token = req.cookies?.token;
  if (!token) {
    return next(new AppError('Not authorized', 401));
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch {
    return next(new AppError('Not authorized', 401));
  }

  next();
};
