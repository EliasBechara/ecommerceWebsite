/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { getCurrentUser, loginController, logoutController, registerController, updatePasswordController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema, updatePasswordSchema } from './auth.schemas';
import rateLimit from 'express-rate-limit';
import { protect } from '../../middleware/protect';

const isTest = process.env.NODE_ENV === 'test';

export const loginLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
    windowMs: 60 * 5000, // 5 min
    max: 10000,
    message: 'Too many login attempts. Try again later.',
  });

export const registerLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
    windowMs: 60 * 60 * 4000, // 4 hour
    max: 1000,
    message: 'Too many account creation attempts. Try again later.',
  });

export const updatePasswordLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5000,
    message: 'Too many password update attempts. Try again later.',
  });

const router = Router();

router.post(
  '/register',
  registerLimiter,
  validate(registerSchema, 'body'),
  registerController,
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema, 'body'),
  loginController,
);

router.get('/me', protect, getCurrentUser);


router.patch('/update-password', updatePasswordLimiter, protect, validate(updatePasswordSchema, 'body'), updatePasswordController)

router.post('/logout', logoutController);

export default router;
