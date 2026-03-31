import { Router } from 'express';
import { loginController, registerController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schemas';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 60 * 5000, // 5 min
  max: 5,
  message: 'Too many login attempts. Try again later.',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many account creation attempts. Try again later.',
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

export default router;
