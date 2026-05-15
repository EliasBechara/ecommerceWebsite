import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { CreatePaymentInput, ConfirmPaymentInput } from './payment.schemas';

export const createPayment = async (userId: string, data: CreatePaymentInput) => {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });

    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Forbidden', 403);
    if (order.status === 'CANCELLED') throw new AppError('Cannot pay for a cancelled order', 400);

    const existing = await prisma.payment.findFirst({
        where: { orderId: data.orderId, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (existing) throw new AppError('An active payment already exists for this order', 409);

    // Mock: generate a provider reference as if a gateway returned one
    const mockProviderReference = `mock_${crypto.randomUUID()}`;

    const payment = await prisma.payment.create({
        data: {
            orderId: data.orderId,
            userId,
            method: data.method,
            currency: data.currency,
            amount: order.total,
            status: 'PENDING',
            providerReference: mockProviderReference,
        },
    });

    return payment;
};

export const confirmPayment = async (paymentId: string, data: ConfirmPaymentInput) => {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.status === 'CONFIRMED') throw new AppError('Payment is already confirmed', 400);
    if (payment.status === 'FAILED') throw new AppError('Cannot confirm a failed payment', 400);

    if (payment.providerReference !== data.providerReference) {
        throw new AppError('Provider reference mismatch', 400);
    }

    const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'CONFIRMED' },
        }),
        prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'CONFIRMED' },
        }),
    ]);

    return updatedPayment;
};

export const getPaymentStatus = async (paymentId: string, userId: string) => {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.userId !== userId) throw new AppError('Forbidden', 403);

    return {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
    };
};