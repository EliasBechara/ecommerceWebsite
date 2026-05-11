import { Router } from 'express';
import { validateStock, decrementStock } from './stock.controller';
import { validate } from '../../middleware/validate';
import {
    stockSlugSchema,
    decrementStockSchema,
} from './stock.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

export const stockRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        message: 'Too many stock requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get(
    '/:slug/validate',
    stockRateLimiter,
    validate(stockSlugSchema, 'params'),
    validateStock,
);

router.patch(
    '/:slug/decrement',
    validate(decrementStockSchema, 'body'),
    decrementStock,
);

export default router;