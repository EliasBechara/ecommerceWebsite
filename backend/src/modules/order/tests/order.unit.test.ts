import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../utils/AppError';
import { createOrder, getOrderById, getUserOrders, updateOrderStatus } from '../order.service';

vi.mock('../../../lib/prisma', () => ({
    prisma: {
        product: { findMany: vi.fn() },
        order: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedPrisma = prisma as any;

// ─── createOrder ─────────────────────────────────────────────────────────────

describe('createOrder', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should create and return an order when valid', async () => {
        const mockProducts = [
            { id: 'p1', price: 100, stock: 10 },
            { id: 'p2', price: 200, stock: 5 },
        ];

        const mockOrder = {
            id: 'order-1',
            userId: 'user-1',
            total: 500,
            status: 'PENDING',
            items: [
                { productId: 'p1', quantity: 1, unitPrice: 100 },
                { productId: 'p2', quantity: 2, unitPrice: 200 },
            ],
        };

        mockedPrisma.product.findMany.mockResolvedValue(mockProducts);
        mockedPrisma.order.create.mockResolvedValue(mockOrder);

        const result = await createOrder('user-1', {
            items: [
                { productId: 'p1', quantity: 1 },
                { productId: 'p2', quantity: 2 },
            ],
        });

        expect(mockedPrisma.order.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                total: 500,
                items: {
                    create: [
                        { productId: 'p1', quantity: 1, unitPrice: 100 },
                        { productId: 'p2', quantity: 2, unitPrice: 200 },
                    ],
                },
            },
            include: { items: true },
        });

        expect(result).toEqual(mockOrder);
    });

    it('should throw if one or more products are not found', async () => {
        mockedPrisma.product.findMany.mockResolvedValue([{ id: 'p1', price: 100 }]);

        await expect(
            createOrder('user-1', {
                items: [
                    { productId: 'p1', quantity: 1 },
                    { productId: 'p-missing', quantity: 1 },
                ],
            }),
        ).rejects.toThrow('One or more products were not found');
    });

    it('should calculate total correctly', async () => {
        const mockProducts = [{ id: 'p1', price: 50 }];
        mockedPrisma.product.findMany.mockResolvedValue(mockProducts);
        mockedPrisma.order.create.mockResolvedValue({ total: 150 });

        await createOrder('user-1', { items: [{ productId: 'p1', quantity: 3 }] });

        expect(mockedPrisma.order.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ total: 150 }) }),
        );
    });
});

// ─── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should return the order when it belongs to the user', async () => {
        const mockOrder = { id: 'order-1', userId: 'user-1', items: [] };
        mockedPrisma.order.findUnique.mockResolvedValue(mockOrder);

        const result = await getOrderById('order-1', 'user-1');

        expect(mockedPrisma.order.findUnique).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            include: { items: { include: { product: true } } },
        });

        expect(result).toEqual(mockOrder);
    });

    it('should throw 404 if order does not exist', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue(null);

        await expect(getOrderById('order-missing', 'user-1')).rejects.toThrow(
            new AppError('Order not found', 404),
        );
    });

    it('should throw 403 if order belongs to a different user', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            userId: 'user-2',
            items: [],
        });

        await expect(getOrderById('order-1', 'user-1')).rejects.toThrow(
            new AppError('Forbidden', 403),
        );
    });
});

// ─── getUserOrders ────────────────────────────────────────────────────────────

describe('getUserOrders', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should return all orders for the user', async () => {
        const mockOrders = [
            { id: 'order-1', userId: 'user-1', items: [] },
            { id: 'order-2', userId: 'user-1', items: [] },
        ];

        mockedPrisma.order.findMany.mockResolvedValue(mockOrders);

        const result = await getUserOrders('user-1');

        expect(mockedPrisma.order.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });

        expect(result).toEqual(mockOrders);
    });

    it('should return an empty array if user has no orders', async () => {
        mockedPrisma.order.findMany.mockResolvedValue([]);

        const result = await getUserOrders('user-1');

        expect(result).toEqual([]);
    });
});

// ─── updateOrderStatus ────────────────────────────────────────────────────────

describe('updateOrderStatus', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should update and return the order with the new status', async () => {
        const mockExisting = { id: 'order-1', status: 'PENDING' };
        const mockUpdated = { id: 'order-1', status: 'SHIPPED', items: [] };

        mockedPrisma.order.findUnique.mockResolvedValue(mockExisting);
        mockedPrisma.order.update.mockResolvedValue(mockUpdated);

        const result = await updateOrderStatus('order-1', { status: 'SHIPPED' });

        expect(mockedPrisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: { status: 'SHIPPED' },
            include: { items: true },
        });

        expect(result).toEqual(mockUpdated);
    });

    it('should throw 404 if order does not exist', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue(null);

        await expect(
            updateOrderStatus('order-missing', { status: 'CONFIRMED' }),
        ).rejects.toThrow(new AppError('Order not found', 404));
    });

    it('should throw if order is already CANCELLED', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            status: 'CANCELLED',
        });

        await expect(
            updateOrderStatus('order-1', { status: 'CONFIRMED' }),
        ).rejects.toThrow(new AppError('Cannot update a cancelled order', 400));
    });
});