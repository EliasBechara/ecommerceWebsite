import { Router } from 'express';
import {
    createPaymentHandler,
    confirmPaymentHandler,
    getPaymentStatusHandler,
} from './payment.controller';
import { validate } from '../../middleware/validate';
import { protect } from '../../middleware/protect';
import { createPaymentSchema, confirmPaymentSchema, paymentIdSchema } from './payment.schemas';

const router = Router();

router.use(protect);

router.post(
    '/',
    validate(createPaymentSchema, 'body'),
    createPaymentHandler,
);

router.patch(
    '/:paymentId/confirm',
    validate(paymentIdSchema, 'params'),
    validate(confirmPaymentSchema, 'body'),
    confirmPaymentHandler,
);

router.get(
    '/:paymentId/status',
    validate(paymentIdSchema, 'params'),
    getPaymentStatusHandler,
);

export default router;