import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../utils/AppError';
import { createPayment, confirmPayment, getPaymentStatus } from '../payment.service';

vi.mock('../../../lib/prisma', () => ({
    prisma: {
        order: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        payment: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedPrisma = prisma as any;

// ─── createPayment ────────────────────────────────────────────────────────────

describe('createPayment', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should create and return a payment when valid', async () => {
        const mockOrder = { id: 'order-1', userId: 'user-1', total: 500, status: 'PENDING' };
        const mockPayment = {
            id: 'payment-1',
            orderId: 'order-1',
            userId: 'user-1',
            method: 'PIX',
            currency: 'BRL',
            amount: 500,
            status: 'PENDING',
            providerReference: 'mock_ref',
        };

        mockedPrisma.order.findUnique.mockResolvedValue(mockOrder);
        mockedPrisma.payment.findFirst.mockResolvedValue(null);
        mockedPrisma.payment.create.mockResolvedValue(mockPayment);

        const result = await createPayment('user-1', {
            orderId: 'order-1',
            method: 'PIX',
            currency: 'BRL',
        });

        expect(mockedPrisma.payment.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    orderId: 'order-1',
                    userId: 'user-1',
                    method: 'PIX',
                    currency: 'BRL',
                    amount: 500,
                    status: 'PENDING',
                }),
            }),
        );

        expect(result).toEqual(mockPayment);
    });

    it('should throw 404 if order does not exist', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue(null);

        await expect(
            createPayment('user-1', { orderId: 'order-missing', method: 'PIX', currency: 'BRL' }),
        ).rejects.toThrow(new AppError('Order not found', 404));
    });

    it('should throw 403 if order belongs to a different user', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            userId: 'user-2',
            total: 500,
            status: 'PENDING',
        });

        await expect(
            createPayment('user-1', { orderId: 'order-1', method: 'PIX', currency: 'BRL' }),
        ).rejects.toThrow(new AppError('Forbidden', 403));
    });

    it('should throw 400 if order is CANCELLED', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            userId: 'user-1',
            total: 500,
            status: 'CANCELLED',
        });

        await expect(
            createPayment('user-1', { orderId: 'order-1', method: 'PIX', currency: 'BRL' }),
        ).rejects.toThrow(new AppError('Cannot pay for a cancelled order', 400));
    });

    it('should throw 409 if an active payment already exists for the order', async () => {
        mockedPrisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            userId: 'user-1',
            total: 500,
            status: 'PENDING',
        });
        mockedPrisma.payment.findFirst.mockResolvedValue({
            id: 'payment-existing',
            status: 'PENDING',
        });

        await expect(
            createPayment('user-1', { orderId: 'order-1', method: 'PIX', currency: 'BRL' }),
        ).rejects.toThrow(new AppError('An active payment already exists for this order', 409));
    });
});

// ─── confirmPayment ───────────────────────────────────────────────────────────

describe('confirmPayment', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should confirm payment and update order status atomically', async () => {
        const mockPayment = {
            id: 'payment-1',
            orderId: 'order-1',
            status: 'PENDING',
            providerReference: 'mock_ref_123',
        };
        const mockConfirmed = { ...mockPayment, status: 'CONFIRMED' };

        mockedPrisma.payment.findUnique.mockResolvedValue(mockPayment);
        mockedPrisma.payment.update.mockResolvedValue(mockConfirmed);
        mockedPrisma.order.update.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });
        mockedPrisma.$transaction.mockImplementation((ops: Promise<unknown>[]) =>
            Promise.all(ops),
        );

        const result = await confirmPayment('payment-1', {
            paymentId: 'payment-1',
            providerReference: 'mock_ref_123',
        });

        expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
        expect(mockedPrisma.payment.update).toHaveBeenCalledWith({
            where: { id: 'payment-1' },
            data: { status: 'CONFIRMED' },
        });
        expect(mockedPrisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: { status: 'CONFIRMED' },
        });
        expect(result).toEqual(mockConfirmed);
    });

    it('should throw 404 if payment does not exist', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue(null);

        await expect(
            confirmPayment('payment-missing', {
                paymentId: 'payment-missing',
                providerReference: 'mock_ref',
            }),
        ).rejects.toThrow(new AppError('Payment not found', 404));
    });

    it('should throw 400 if payment is already CONFIRMED', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue({
            id: 'payment-1',
            status: 'CONFIRMED',
            providerReference: 'mock_ref',
        });

        await expect(
            confirmPayment('payment-1', {
                paymentId: 'payment-1',
                providerReference: 'mock_ref',
            }),
        ).rejects.toThrow(new AppError('Payment is already confirmed', 400));
    });

    it('should throw 400 if payment is FAILED', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue({
            id: 'payment-1',
            status: 'FAILED',
            providerReference: 'mock_ref',
        });

        await expect(
            confirmPayment('payment-1', {
                paymentId: 'payment-1',
                providerReference: 'mock_ref',
            }),
        ).rejects.toThrow(new AppError('Cannot confirm a failed payment', 400));
    });

    it('should throw 400 if providerReference does not match', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue({
            id: 'payment-1',
            status: 'PENDING',
            providerReference: 'mock_ref_correct',
        });

        await expect(
            confirmPayment('payment-1', {
                paymentId: 'payment-1',
                providerReference: 'mock_ref_wrong',
            }),
        ).rejects.toThrow(new AppError('Provider reference mismatch', 400));
    });
});

// ─── getPaymentStatus ─────────────────────────────────────────────────────────

describe('getPaymentStatus', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should return the payment status for the correct user', async () => {
        const mockPayment = {
            id: 'payment-1',
            orderId: 'order-1',
            userId: 'user-1',
            status: 'CONFIRMED',
            method: 'PIX',
            amount: 500,
            currency: 'BRL',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-02'),
        };

        mockedPrisma.payment.findUnique.mockResolvedValue(mockPayment);

        const result = await getPaymentStatus('payment-1', 'user-1');

        expect(mockedPrisma.payment.findUnique).toHaveBeenCalledWith({
            where: { id: 'payment-1' },
        });

        expect(result).toEqual({
            paymentId: 'payment-1',
            orderId: 'order-1',
            status: 'CONFIRMED',
            method: 'PIX',
            amount: 500,
            currency: 'BRL',
            createdAt: mockPayment.createdAt,
            updatedAt: mockPayment.updatedAt,
        });
    });

    it('should throw 404 if payment does not exist', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue(null);

        await expect(getPaymentStatus('payment-missing', 'user-1')).rejects.toThrow(
            new AppError('Payment not found', 404),
        );
    });

    it('should throw 403 if payment belongs to a different user', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue({
            id: 'payment-1',
            userId: 'user-2',
            status: 'PENDING',
        });

        await expect(getPaymentStatus('payment-1', 'user-1')).rejects.toThrow(
            new AppError('Forbidden', 403),
        );
    });

    it('should not expose providerReference in the returned object', async () => {
        mockedPrisma.payment.findUnique.mockResolvedValue({
            id: 'payment-1',
            orderId: 'order-1',
            userId: 'user-1',
            status: 'PENDING',
            method: 'BOLETO',
            amount: 300,
            currency: 'BRL',
            providerReference: 'mock_secret_ref',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await getPaymentStatus('payment-1', 'user-1');

        expect(result).not.toHaveProperty('providerReference');
    });
});