import { Router } from 'express';
import {
    createOrderHandler,
    getOrderByIdHandler,
    getUserOrdersHandler,
    updateOrderStatusHandler,
} from './order.controller';
import { validate } from '../../middleware/validate';
import { protect } from '../../middleware/protect';
import { createOrderSchema, orderIdSchema, updateOrderStatusSchema } from './order.schemas';


const router = Router();

router.use(protect);

router.post(
    '/',
    validate(createOrderSchema, 'body'),
    createOrderHandler,
);

router.get(
    '/my-orders',
    getUserOrdersHandler,
);

router.get(
    '/:orderId',
    validate(orderIdSchema, 'params'),
    getOrderByIdHandler,
);

router.patch(
    '/:orderId/status',
    validate(orderIdSchema, 'params'),
    validate(updateOrderStatusSchema, 'body'),
    updateOrderStatusHandler,
);

export default router;