import { prisma } from '../../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createCheckoutSession,
    getCheckoutSession,
    updateCheckoutAddress,
    calculateCheckoutSummary,
    confirmCheckoutSession,
    expireCheckoutSession,
} from '../checkout.service';
import { AppError } from '../../../utils/AppError';

vi.mock('../../../lib/prisma', () => ({
    prisma: {
        cartItem: { findMany: vi.fn(), deleteMany: vi.fn() },
        checkoutSession: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        address: { findUnique: vi.fn() },
        product: { findUnique: vi.fn(), update: vi.fn() },
        $transaction: vi.fn(),
    },
}));

vi.mock('../../order/order.service', () => ({
    createOrder: vi.fn(),
}));

import { createOrder } from '../../order/order.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedPrisma = prisma as any;
const mockedCreateOrder = createOrder as ReturnType<typeof vi.fn>;

// ── Shared fixtures ───────────────────────────────────────────────────────────

const mockProduct = { id: 'p1', name: 'Shoes', price: 100, stock: 10 };

const mockCartItems = [
    { productId: 'p1', quantity: 2, product: mockProduct },
];

const mockSession = {
    id: 'session-1',
    userId: 'user-1',
    status: 'PENDING',
    addressId: 'addr-1',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    items: [
        { productId: 'p1', quantity: 2, unitPrice: 100, product: mockProduct },
    ],
};



describe('createCheckoutSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a session from valid cart items', async () => {
        mockedPrisma.cartItem.findMany.mockResolvedValue(mockCartItems);
        mockedPrisma.checkoutSession.create.mockResolvedValue(mockSession);

        const result = await createCheckoutSession('user-1');

        expect(mockedPrisma.cartItem.findMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' } },
            include: { product: true },
        });

        expect(mockedPrisma.checkoutSession.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    status: 'PENDING',
                    items: {
                        create: [
                            { productId: 'p1', quantity: 2, unitPrice: 100 },
                        ],
                    },
                }),
            }),
        );

        expect(result).toEqual(mockSession);
    });

    it('should throw 400 if cart is empty', async () => {
        mockedPrisma.cartItem.findMany.mockResolvedValue([]);

        await expect(createCheckoutSession('user-1')).rejects.toThrow(
            new AppError('Your cart is empty', 400),
        );
    });

    it('should throw 409 if a product has insufficient stock', async () => {
        const lowStockItems = [
            { productId: 'p1', quantity: 5, product: { ...mockProduct, stock: 2 } },
        ];

        mockedPrisma.cartItem.findMany.mockResolvedValue(lowStockItems);

        await expect(createCheckoutSession('user-1')).rejects.toThrow(
            new AppError(`Insufficient stock for "Shoes". Available: 2`, 409),
        );
    });
});



describe('getCheckoutSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return session when valid', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);

        const result = await getCheckoutSession('session-1', 'user-1');

        expect(result).toEqual(mockSession);
    });

    it('should throw 404 if session does not exist', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(null);

        await expect(getCheckoutSession('session-1', 'user-1')).rejects.toThrow(
            new AppError('Checkout session not found', 404),
        );
    });

    it('should throw 403 if session belongs to another user', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            userId: 'other-user',
        });

        await expect(getCheckoutSession('session-1', 'user-1')).rejects.toThrow(
            new AppError('Forbidden', 403),
        );
    });

    it('should throw 410 if session is expired', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            status: 'EXPIRED',
        });

        await expect(getCheckoutSession('session-1', 'user-1')).rejects.toThrow(
            new AppError('Session has expired', 410),
        );
    });

    it('should throw 409 if session is already confirmed', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            status: 'CONFIRMED',
        });

        await expect(getCheckoutSession('session-1', 'user-1')).rejects.toThrow(
            new AppError('Session already confirmed', 409),
        );
    });
});



describe('updateCheckoutAddress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update address when valid', async () => {
        const mockAddress = { id: 'addr-1', userId: 'user-1' };
        const updatedSession = { ...mockSession, addressId: 'addr-1' };

        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.address.findUnique.mockResolvedValue(mockAddress);
        mockedPrisma.checkoutSession.update.mockResolvedValue(updatedSession);

        const result = await updateCheckoutAddress('session-1', 'user-1', 'addr-1');

        expect(mockedPrisma.checkoutSession.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { address: { connect: { id: 'addr-1' } } },
            include: { items: { include: { product: true } } },
        });

        expect(result).toEqual(updatedSession);
    });

    it('should throw 404 if address does not exist', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.address.findUnique.mockResolvedValue(null);

        await expect(
            updateCheckoutAddress('session-1', 'user-1', 'addr-1'),
        ).rejects.toThrow(new AppError('Address not found', 404));
    });

    it('should throw 403 if address belongs to another user', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.address.findUnique.mockResolvedValue({
            id: 'addr-1',
            userId: 'other-user',
        });

        await expect(
            updateCheckoutAddress('session-1', 'user-1', 'addr-1'),
        ).rejects.toThrow(new AppError('Forbidden', 403));
    });
});



describe('calculateCheckoutSummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should apply shipping cost when total is <= 200', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);

        const result = await calculateCheckoutSummary('session-1', 'user-1');

        expect(result).toEqual({
            sessionId: 'session-1',
            itemsTotal: 200,
            shippingCost: 15,
            total: 215,
        });
    });

    it('should waive shipping cost when items total exceeds 200', async () => {
        const expensiveSession = {
            ...mockSession,
            items: [{ productId: 'p1', quantity: 3, unitPrice: 100, product: mockProduct }],
        };

        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(expensiveSession);

        const result = await calculateCheckoutSummary('session-1', 'user-1');

        expect(result).toEqual({
            sessionId: 'session-1',
            itemsTotal: 300,
            shippingCost: 0,
            total: 300,
        });
    });

    it('should throw if session is not found', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(null);

        await expect(
            calculateCheckoutSummary('session-1', 'user-1'),
        ).rejects.toThrow(new AppError('Checkout session not found', 404));
    });
});



describe('confirmCheckoutSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should confirm session, decrement stock, create order, and clear cart', async () => {
        const mockOrder = { id: 'order-1' };
        const confirmedSession = { ...mockSession, status: 'CONFIRMED' };

        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockedPrisma.$transaction.mockResolvedValue([]);
        mockedCreateOrder.mockResolvedValue(mockOrder);
        mockedPrisma.checkoutSession.update.mockResolvedValue(confirmedSession);
        mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

        const result = await confirmCheckoutSession('session-1', 'user-1');

        expect(mockedPrisma.$transaction).toHaveBeenCalled();

        expect(mockedCreateOrder).toHaveBeenCalledWith('user-1', {
            items: [{ productId: 'p1', quantity: 2 }],
        });

        expect(mockedPrisma.checkoutSession.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'session-1' },
                data: expect.objectContaining({ status: 'CONFIRMED' }),
            }),
        );

        expect(mockedPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
            where: { cart: { userId: 'user-1' } },
        });

        expect(result).toEqual({ confirmed: confirmedSession, order: mockOrder });
    });

    it('should throw 400 if no address is set', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            addressId: null,
        });

        await expect(
            confirmCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(
            new AppError('Delivery address is required before confirming', 400),
        );
    });

    it('should throw 404 if a product no longer exists', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.product.findUnique.mockResolvedValue(null);

        await expect(
            confirmCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError(`Product "Shoes" no longer exists`, 404));
    });

    it('should throw 409 if stock is insufficient at confirm time', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 1 });

        await expect(
            confirmCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError(`Insufficient stock for "Shoes"`, 409));
    });

    it('should throw if session is expired', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            status: 'EXPIRED',
        });

        await expect(
            confirmCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError('Session has expired', 410));
    });
});


describe('expireCheckoutSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should expire a pending session', async () => {
        const expiredSession = { ...mockSession, status: 'EXPIRED' };

        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
        mockedPrisma.checkoutSession.update.mockResolvedValue(expiredSession);

        const result = await expireCheckoutSession('session-1', 'user-1');

        expect(mockedPrisma.checkoutSession.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { status: 'EXPIRED' },
        });

        expect(result).toEqual(expiredSession);
    });

    it('should throw 404 if session does not exist', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue(null);

        await expect(
            expireCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError('Checkout session not found', 404));
    });

    it('should throw 403 if session belongs to another user', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            userId: 'other-user',
        });

        await expect(
            expireCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError('Forbidden', 403));
    });

    it('should throw 410 if session is already expired', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            status: 'EXPIRED',
        });

        await expect(
            expireCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError('Session has expired', 410));
    });

    it('should throw 409 if session is already confirmed', async () => {
        mockedPrisma.checkoutSession.findUnique.mockResolvedValue({
            ...mockSession,
            status: 'CONFIRMED',
        });

        await expect(
            expireCheckoutSession('session-1', 'user-1'),
        ).rejects.toThrow(new AppError('Session already confirmed', 409));
    });
});