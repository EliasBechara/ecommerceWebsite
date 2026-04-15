import { Router } from 'express';
import {
  getProductsByCategory,
  getSingleProduct,
  searchForProducts,
} from './products.controller';
import { validate } from '../../middleware/validate';
import {
  getProductsByCategorySchema,
  searchForProductsSchema,
  slugSchema,
} from './products.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: 'Too many search requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  '/search',
  searchRateLimiter,
  validate(searchForProductsSchema, 'query'),
  searchForProducts,
);

router.get(
  '/category/:category',
  validate(getProductsByCategorySchema, 'params'),
  getProductsByCategory,
);

router.get('/:slug', validate(slugSchema, 'params'), getSingleProduct);

export default router;
