import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import {
    UpdateProfileInput,
    CreateAddressInput,
    UpdateAddressInput,
} from './users.schema';

// ─── Profile ────────────────────────────────────────────────────────────────

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            createdAt: true,
        },
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
};

export const updateUserProfile = async (
    userId: string,
    input: UpdateProfileInput,
) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber ?? null,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
        },
    });

    return user;
};

// ─── Addresses ──────────────────────────────────────────────────────────────

export const getUserAddresses = async (userId: string) => {
    return prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        select: {
            id: true,
            label: true,
            recipientName: true,
            phoneNumber: true,
            street: true,
            number: true,
            complement: true,
            district: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            isDefault: true,
        },
    });
};

export const createAddress = async (
    userId: string,
    input: CreateAddressInput,
) => {
    // If this address is set as default, unset the current default first
    if (input.isDefault) {
        await prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }

    // If this is the user's first address, make it default automatically
    const addressCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = input.isDefault || addressCount === 0;

    return prisma.address.create({
        data: {
            userId,
            label: input.label ?? null,
            recipientName: input.recipientName,
            phoneNumber: input.phoneNumber ?? null,
            street: input.street,
            number: input.number,
            complement: input.complement ?? null,
            district: input.district,
            city: input.city,
            state: input.state,
            zipCode: input.zipCode,
            country: input.country ?? 'BR',
            isDefault: shouldBeDefault,
        },
        select: {
            id: true,
            label: true,
            recipientName: true,
            phoneNumber: true,
            street: true,
            number: true,
            complement: true,
            district: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            isDefault: true,
        },
    });
};

export const updateAddress = async (
    userId: string,
    addressId: string,
    input: UpdateAddressInput,
) => {
    const address = await prisma.address.findUnique({ where: { id: addressId } });

    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Forbidden', 403);

    // If setting this one as default, unset others first
    if (input.isDefault) {
        await prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }

    return prisma.address.update({
        where: { id: addressId },
        data: {
            ...(input.label !== undefined && { label: input.label }),
            ...(input.recipientName !== undefined && { recipientName: input.recipientName }),
            ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
            ...(input.street !== undefined && { street: input.street }),
            ...(input.number !== undefined && { number: input.number }),
            ...(input.complement !== undefined && { complement: input.complement }),
            ...(input.district !== undefined && { district: input.district }),
            ...(input.city !== undefined && { city: input.city }),
            ...(input.state !== undefined && { state: input.state }),
            ...(input.zipCode !== undefined && { zipCode: input.zipCode }),
            ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        },
        select: {
            id: true,
            label: true,
            recipientName: true,
            phoneNumber: true,
            street: true,
            number: true,
            complement: true,
            district: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            isDefault: true,
        },
    });
};

export const deleteAddress = async (userId: string, addressId: string) => {
    const address = await prisma.address.findUnique({ where: { id: addressId } });

    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Forbidden', 403);

    await prisma.address.delete({ where: { id: addressId } });

    // If the deleted address was the default, promote the oldest remaining one
    if (address.isDefault) {
        const next = await prisma.address.findFirst({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
        if (next) {
            await prisma.address.update({
                where: { id: next.id },
                data: { isDefault: true },
            });
        }
    }
};