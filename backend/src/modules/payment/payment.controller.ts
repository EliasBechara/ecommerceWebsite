import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { createPayment, confirmPayment, getPaymentStatus } from './payment.service';
import { CreatePaymentInput, ConfirmPaymentInput, PaymentIdInput } from './payment.schemas';
import { asyncHandler } from '../../middleware/asyncHandler';

export const createPaymentHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req.user as JwtPayload).id;
        const body = req.body as CreatePaymentInput;
        const payment = await createPayment(userId, body);
        res.status(201).json(payment);
    },
);

export const confirmPaymentHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { paymentId } = req.params as unknown as PaymentIdInput;
        const body = req.body as ConfirmPaymentInput;
        const payment = await confirmPayment(paymentId, body);
        res.status(200).json(payment);
    },
);

export const getPaymentStatusHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req.user as JwtPayload).id;
        const { paymentId } = req.params as unknown as PaymentIdInput;
        const status = await getPaymentStatus(paymentId, userId);
        res.status(200).json(status);
    },
);