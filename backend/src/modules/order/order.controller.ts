import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { CreateOrderInput, OrderIdInput, UpdateOrderStatusInput } from './order.schemas';
import { createOrder, getOrderById, getUserOrders, updateOrderStatus, } from './order.service';
import { JwtPayload } from 'jsonwebtoken';


export const createOrderHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req.user as JwtPayload).id;
        const body = req.body as CreateOrderInput;
        const order = await createOrder(userId, body);
        res.status(201).json(order);
    },
);

export const getUserOrdersHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req.user as JwtPayload).id;
        const orders = await getUserOrders(userId);
        res.status(200).json(orders);
    },
);

export const updateOrderStatusHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { orderId } = req.params as OrderIdInput;
        const body = req.body as UpdateOrderStatusInput;
        const updated = await updateOrderStatus(orderId, body);
        res.status(200).json(updated);
    },
);

export const getOrderByIdHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { orderId } = req.params as OrderIdInput;
        const userId = (req.user as JwtPayload).id;
        const order = await getOrderById(orderId, userId);
        res.status(200).json(order);
    },
);