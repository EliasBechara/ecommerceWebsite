import { Request, Response } from 'express';
import {
    createCheckoutSession,
    getCheckoutSession,
    updateCheckoutAddress,
    calculateCheckoutSummary,
    confirmCheckoutSession,
    expireCheckoutSession,
} from './checkout.service';
import {
    GetSessionInput,
    UpdateAddressInput,
    CalculateSummaryInput,
    ConfirmCheckoutInput,
    ExpireSessionInput,
} from './checkout.schema';
import { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from '../../middleware/asyncHandler';

export const createSession = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req.user as JwtPayload).id;
        const session = await createCheckoutSession(userId);
        res.status(201).json(session);
    },
);

export const getSession = asyncHandler(
    async (req: Request, res: Response) => {
        const { sessionId } = req.params as GetSessionInput;
        const userId = (req.user as JwtPayload).id;
        const session = await getCheckoutSession(sessionId, userId);
        res.status(200).json(session);
    },
);

export const updateAddress = asyncHandler(
    async (req: Request, res: Response) => {
        const { sessionId } = req.params as Pick<UpdateAddressInput, 'sessionId'>;
        const { addressId } = req.body as UpdateAddressInput;
        const userId = (req.user as JwtPayload).id;
        const session = await updateCheckoutAddress(sessionId, userId, addressId);
        res.status(200).json(session);
    },
);

export const calculateSummary = asyncHandler(
    async (req: Request, res: Response) => {
        const { sessionId } = req.params as CalculateSummaryInput;
        const userId = (req.user as JwtPayload).id;
        const summary = await calculateCheckoutSummary(sessionId, userId);
        res.status(200).json(summary);
    },
);

export const confirmCheckout = asyncHandler(
    async (req: Request, res: Response) => {
        const { sessionId } = req.params as ConfirmCheckoutInput;
        const userId = (req.user as JwtPayload).id;
        const confirmed = await confirmCheckoutSession(sessionId, userId);
        res.status(200).json(confirmed);
    },
);

export const expireSession = asyncHandler(
    async (req: Request, res: Response) => {
        const { sessionId } = req.params as ExpireSessionInput;
        const userId = (req.user as JwtPayload).id;
        const expired = await expireCheckoutSession(sessionId, userId);
        res.status(200).json(expired);
    },
);