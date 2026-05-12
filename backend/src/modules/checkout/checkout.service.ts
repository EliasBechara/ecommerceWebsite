import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { UpdateAddressInput } from './checkout.schema';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_TTL_MINUTES = 30;

const getActiveSession = async (sessionId: string, userId: string) => {
    const session = await prisma.checkoutSession.findUnique({
        where: { id: sessionId },
        include: { items: { include: { product: true } } },
    });

    if (!session) throw new AppError('Checkout session not found', 404);
    if (session.userId !== userId) throw new AppError('Forbidden', 403);
    if (session.status === 'EXPIRED') throw new AppError('Session has expired', 410);
    if (session.status === 'CONFIRMED') throw new AppError('Session already confirmed', 409);

    return session;
};

// ── Functions ─────────────────────────────────────────────────────────

export const createCheckoutSession = async (userId: string) => {
    const cartItems = await prisma.cartItem.findMany({
        where: {
            cart: {
                userId,
            },
        },
        include: {
            product: true,
        },
    });

    if (!cartItems.length) {
        throw new AppError('Your cart is empty', 400);
    }

    for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`,
                409,
            );
        }
    }

    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

    const session = await prisma.checkoutSession.create({
        data: {
            userId,
            status: 'PENDING',
            expiresAt,
            paymentIntentId: null, // placeholder
            items: {
                create: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.product.price,
                })),
            },
        },
        include: { items: { include: { product: true } } },
    });

    return session;
};

export const getCheckoutSession = async (
    sessionId: string,
    userId: string,
) => {
    return getActiveSession(sessionId, userId);
};

export const updateCheckoutAddress = async (
    sessionId: string,
    userId: string,
    address: UpdateAddressInput['address'],
) => {
    await getActiveSession(sessionId, userId);

    const updated = await prisma.checkoutSession.update({
        where: { id: sessionId },
        data: { address },
        include: { items: { include: { product: true } } },
    });

    return updated;
};

export const calculateCheckoutSummary = async (
    sessionId: string,
    userId: string,
) => {
    const session = await getActiveSession(sessionId, userId);

    const itemsTotal = session.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
    );

    const shippingCost = itemsTotal > 200 ? 0 : 15;

    const total = parseFloat(
        (itemsTotal + shippingCost).toFixed(2),
    );

    return {
        sessionId,
        itemsTotal,
        shippingCost,
        total,
    };
};

export const confirmCheckoutSession = async (
    sessionId: string,
    userId: string,
) => {
    const session = await getActiveSession(sessionId, userId);

    if (!session.address) {
        throw new AppError('Delivery address is required before confirming', 400);
    }

    // Decrement stock for each item atomically
    await prisma.$transaction(
        session.items.map((item) =>
            prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            }),
        ),
    );

    const confirmed = await prisma.checkoutSession.update({
        where: { id: sessionId },
        data: {
            status: 'CONFIRMED',
            paymentIntentId: `pi_placeholder_${Date.now()}`,
        },
        include: { items: { include: { product: true } } },
    });

    // Clear the cart after confirmation
    await prisma.cartItem.deleteMany({
        where: {
            cart: {
                userId,
            },
        },
    });

    return confirmed;
};

export const expireCheckoutSession = async (
    sessionId: string,
    userId: string,
) => {
    await getActiveSession(sessionId, userId);

    const expired = await prisma.checkoutSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
    });

    return expired;
};