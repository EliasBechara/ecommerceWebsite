import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { CreateOrderInput, UpdateOrderStatusInput } from './order.schemas';


export const createOrder = async (
    userId: string,
    data: CreateOrderInput,
) => {
    const productIds = data.items.map((i) => i.productId);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
        throw new AppError('One or more products were not found', 404);
    }

    const total = data.items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return sum + product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
        data: {
            userId,
            total,
            items: {
                create: data.items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)!;
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: product.price,
                    };
                }),
            },
        },
        include: { items: true },
    });

    return order;
};

export const getOrderById = async (orderId: string, userId: string, isAdmin = false) => {
    if (!orderId) throw new AppError('Order ID is required', 400);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
    });

    if (!order) throw new AppError('Order not found', 404);

    // Note: Admin will be expanded later
    if (!isAdmin && order.userId !== userId) {
        throw new AppError('Forbidden', 403);
    }

    return order;
};

export const getUserOrders = async (userId: string) => {
    if (!userId) throw new AppError('User ID is required', 400);

    const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return orders;
};

export const updateOrderStatus = async (
    orderId: string,
    data: UpdateOrderStatusInput,
) => {
    if (!orderId) throw new AppError('Order ID is required', 400);

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new AppError('Order not found', 404);

    if (existing.status === 'CANCELLED') {
        throw new AppError('Cannot update a cancelled order', 400);
    }

    const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: data.status },
        include: { items: true },
    });

    return updated;
};