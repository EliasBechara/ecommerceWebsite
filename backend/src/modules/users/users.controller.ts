import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from '../../middleware/asyncHandler';
import { AppError } from '../../utils/AppError';
import {
    getUserProfile,
    updateUserProfile,
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
} from './users.service';

// ─── Profile ────────────────────────────────────────────────────────────────

export const getProfileController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.user as JwtPayload;
        if (!id) throw new AppError('Invalid token payload', 401);

        const user = await getUserProfile(id);
        res.status(200).json(user);
    },
);

export const updateProfileController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.user as JwtPayload;
        if (!id) throw new AppError('Invalid token payload', 401);

        const user = await updateUserProfile(id, req.body);
        res.status(200).json(user);
    },
);

// ─── Addresses ──────────────────────────────────────────────────────────────

export const getAddressesController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.user as JwtPayload;
        if (!id) throw new AppError('Invalid token payload', 401);

        const addresses = await getUserAddresses(id);
        res.status(200).json(addresses);
    },
);

export const createAddressController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.user as JwtPayload;
        if (!id) throw new AppError('Invalid token payload', 401);

        const address = await createAddress(id, req.body);
        res.status(201).json(address);
    },
);

export const updateAddressController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.user as JwtPayload;
        if (!id) throw new AppError('Invalid token payload', 401);

        const address = await updateAddress(id, req.params.addressId as string, req.body);
        res.status(200).json(address);
    },
);

export const deleteAddressController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.user as JwtPayload;
        if (!id) throw new AppError('Invalid token payload', 401);

        await deleteAddress(id, req.params.addressId as string);
        res.status(204).send();
    },
);