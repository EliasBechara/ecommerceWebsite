/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../../../lib/prisma';
import { AppError } from '../../../../utils/AppError';
import { createCheckoutSession, getCheckoutSession, updateCheckoutAddress, calculateCheckoutSummary, confirmCheckoutSession, expireCheckoutSession } from '../../checkout.service';



vi.mock('../../../../lib/prisma', () => ({
    prisma: {
        cartItem: {
            findMany: vi.fn(),
            deleteMany: vi.fn(),
        },

        checkoutSession: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },

        product: {
            update: vi.fn(),
        },

        $transaction: vi.fn(),
    },
}));

describe('checkout.service', () => {
    const userId = 'user-1';
    const sessionId = 'session-1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createCheckoutSession', () => {
        it('should create checkout session successfully', async () => {
            (prisma.cartItem.findMany as any).mockResolvedValue([
                {
                    id: 'cart-item-1',
                    productId: 'product-1',
                    quantity: 2,
                    product: {
                        id: 'product-1',
                        name: 'RTX 5090',
                        price: 100,
                        stock: 10,
                    },
                },
            ]);

            (prisma.checkoutSession.create as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
            });

            const result = await createCheckoutSession(userId);

            expect(prisma.cartItem.findMany).toHaveBeenCalled();

            expect(prisma.checkoutSession.create).toHaveBeenCalled();

            expect(result).toEqual({
                id: sessionId,
                userId,
                status: 'PENDING',
            });
        });

        it('should throw if cart is empty', async () => {
            (prisma.cartItem.findMany as any).mockResolvedValue([]);

            await expect(createCheckoutSession(userId)).rejects.toThrow(
                new AppError('Your cart is empty', 400),
            );
        });

        it('should throw if stock is insufficient', async () => {
            (prisma.cartItem.findMany as any).mockResolvedValue([
                {
                    quantity: 5,
                    product: {
                        name: 'RTX 5090',
                        stock: 1,
                    },
                },
            ]);

            await expect(createCheckoutSession(userId)).rejects.toThrow(
                new AppError(
                    'Insufficient stock for "RTX 5090". Available: 1',
                    409,
                ),
            );
        });
    });

    describe('getCheckoutSession', () => {
        it('should return active session', async () => {
            const mockedSession = {
                id: sessionId,
                userId,
                status: 'PENDING',
                items: [],
            };

            (prisma.checkoutSession.findUnique as any).mockResolvedValue(
                mockedSession,
            );

            const result = await getCheckoutSession(sessionId, userId);

            expect(result).toEqual(mockedSession);
        });

        it('should throw if session does not exist', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue(null);

            await expect(
                getCheckoutSession(sessionId, userId),
            ).rejects.toThrow(
                new AppError('Checkout session not found', 404),
            );
        });

        it('should throw if session belongs to another user', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId: 'another-user',
                status: 'PENDING',
            });

            await expect(
                getCheckoutSession(sessionId, userId),
            ).rejects.toThrow(new AppError('Forbidden', 403));
        });
    });

    describe('updateCheckoutAddress', () => {
        it('should update address successfully', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
            });

            const updatedSession = {
                id: sessionId,
                address: {
                    city: 'Sao Paulo',
                },
            };

            (prisma.checkoutSession.update as any).mockResolvedValue(
                updatedSession,
            );

            const result = await updateCheckoutAddress(
                sessionId,
                userId,
                {
                    fullName: 'Elias',
                    phone: '999999999',
                    street: 'Street',
                    number: '123',
                    city: 'Sao Paulo',
                    state: 'SP',
                    zipCode: '00000000',
                },
            );

            expect(result).toEqual(updatedSession);
        });
    });

    describe('calculateCheckoutSummary', () => {
        it('should calculate totals correctly', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
                items: [
                    {
                        quantity: 2,
                        unitPrice: 100,
                    },
                ],
            });

            const result = await calculateCheckoutSummary(
                sessionId,
                userId,
            );

            expect(result).toEqual({
                sessionId,
                itemsTotal: 200,
                shippingCost: 15,
                total: 215,
            });
        });

        it('should apply free shipping', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
                items: [
                    {
                        quantity: 3,
                        unitPrice: 100,
                    },
                ],
            });

            const result = await calculateCheckoutSummary(
                sessionId,
                userId,
            );

            expect(result.shippingCost).toBe(0);
        });
    });

    describe('confirmCheckoutSession', () => {
        it('should confirm checkout successfully', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
                address: {
                    city: 'Sao Paulo',
                },
                items: [
                    {
                        productId: 'product-1',
                        quantity: 2,
                    },
                ],
            });

            (prisma.$transaction as any).mockResolvedValue(undefined);

            (prisma.checkoutSession.update as any).mockResolvedValue({
                id: sessionId,
                status: 'CONFIRMED',
            });

            const result = await confirmCheckoutSession(
                sessionId,
                userId,
            );

            expect(prisma.$transaction).toHaveBeenCalled();

            expect(prisma.cartItem.deleteMany).toHaveBeenCalled();

            expect(result.status).toBe('CONFIRMED');
        });

        it('should throw if address is missing', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
                address: null,
                items: [],
            });

            await expect(
                confirmCheckoutSession(sessionId, userId),
            ).rejects.toThrow(
                new AppError(
                    'Delivery address is required before confirming',
                    400,
                ),
            );
        });
    });

    describe('expireCheckoutSession', () => {
        it('should expire session successfully', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
            });

            (prisma.checkoutSession.update as any).mockResolvedValue({
                id: sessionId,
                status: 'EXPIRED',
            });

            const result = await expireCheckoutSession(
                sessionId,
                userId,
            );

            expect(result.status).toBe('EXPIRED');
        });
    });

    describe('additional checkout validations', () => {
        it('should throw if session is EXPIRED', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'EXPIRED',
            });

            await expect(
                getCheckoutSession(sessionId, userId),
            ).rejects.toThrow(
                new AppError('Session has expired', 410),
            );
        });

        it('should throw if session is CONFIRMED', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'CONFIRMED',
            });

            await expect(
                getCheckoutSession(sessionId, userId),
            ).rejects.toThrow(
                new AppError('Session already confirmed', 409),
            );
        });

        it('should clear cart after successful confirmation', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
                address: {
                    city: 'Sao Paulo',
                },
                items: [
                    {
                        productId: 'product-1',
                        quantity: 1,
                    },
                ],
            });

            (prisma.$transaction as any).mockResolvedValue(undefined);

            (prisma.checkoutSession.update as any).mockResolvedValue({
                id: sessionId,
                status: 'CONFIRMED',
            });

            await confirmCheckoutSession(sessionId, userId);

            expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
                where: {
                    cart: {
                        userId,
                    },
                },
            });
        });

        it('should decrement stock correctly', async () => {
            (prisma.checkoutSession.findUnique as any).mockResolvedValue({
                id: sessionId,
                userId,
                status: 'PENDING',
                address: {
                    city: 'Sao Paulo',
                },
                items: [
                    {
                        productId: 'product-1',
                        quantity: 2,
                    },
                    {
                        productId: 'product-2',
                        quantity: 3,
                    },
                ],
            });

            (prisma.product.update as any).mockResolvedValue({});

            (prisma.$transaction as any).mockResolvedValue(undefined);

            (prisma.checkoutSession.update as any).mockResolvedValue({
                id: sessionId,
                status: 'CONFIRMED',
            });

            await confirmCheckoutSession(sessionId, userId);

            expect(prisma.product.update).toHaveBeenNthCalledWith(1, {
                where: {
                    id: 'product-1',
                },
                data: {
                    stock: {
                        decrement: 2,
                    },
                },
            });

            expect(prisma.product.update).toHaveBeenNthCalledWith(2, {
                where: {
                    id: 'product-2',
                },
                data: {
                    stock: {
                        decrement: 3,
                    },
                },
            });
        });
    });


});