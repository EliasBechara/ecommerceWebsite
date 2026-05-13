import { Router } from 'express';
import {
    createSession,
    getSession,
    updateAddress,
    calculateSummary,
    confirmCheckout,
    expireSession,
} from './checkout.controller';
import { validate } from '../../middleware/validate';
import {
    getSessionSchema,
    updateAddressBodySchema,
    updateAddressParamsSchema,
    calculateSummarySchema,
    confirmCheckoutSchema,
    expireSessionSchema,
} from './checkout.schema';
import { protect } from '../../middleware/protect';
import rateLimit from 'express-rate-limit';

const router = Router();

export const checkoutRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { message: 'Too many checkout requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(protect);

// Create a new checkout session
router.post('/', checkoutRateLimiter, createSession);

// Get checkout session details
router.get(
    '/:sessionId',
    validate(getSessionSchema, 'params'),
    getSession,
);

// Update checkout shipping address
router.patch(
    '/:sessionId/address',
    validate(
        updateAddressParamsSchema,
        'params',
    ),
    validate(
        updateAddressBodySchema,
        'body',
    ),
    updateAddress,
);

// Calculate checkout summary and totals
router.get(
    '/:sessionId/summary',
    validate(calculateSummarySchema, 'params'),
    calculateSummary,
);

// Confirm and finalize checkout
router.post(
    '/:sessionId/confirm',
    checkoutRateLimiter,
    validate(confirmCheckoutSchema, 'params'),
    confirmCheckout,
);

// Expire checkout session manually
router.patch(
    '/:sessionId/expire',
    validate(expireSessionSchema, 'params'),
    expireSession,
);

export default router;