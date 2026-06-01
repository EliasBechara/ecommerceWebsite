import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { createOrder } from '../order/order.service';


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
    addressId: string,
) => {
    await getActiveSession(sessionId, userId);

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Forbidden', 403);

    const updated = await prisma.checkoutSession.update({
        where: { id: sessionId },
        data: { address: { connect: { id: addressId } } },
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
    const session = await getActiveSession(
        sessionId,
        userId,
    );

    if (!session.addressId) {
        throw new AppError(
            'Delivery address is required before confirming',
            400,
        );
    }

    // Revalidate stock
    for (const item of session.items) {
        const product = await prisma.product.findUnique({
            where: {
                id: item.productId,
            },
        });

        if (!product) {
            throw new AppError(
                `Product "${item.product.name}" no longer exists`,
                404,
            );
        }

        if (product.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for "${product.name}"`,
                409,
            );
        }
    }

    // Decrement stock
    await prisma.$transaction(
        session.items.map((item) =>
            prisma.product.update({
                where: {
                    id: item.productId,
                },

                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            }),
        ),
    );

    // Create permanent order
    const order = await createOrder(userId, {
        items: session.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
        })),
    });

    // Confirm checkout session
    const confirmed =
        await prisma.checkoutSession.update({
            where: {
                id: sessionId,
            },

            data: {
                status: 'CONFIRMED',

                paymentIntentId: `pi_placeholder_${Date.now()}`,
            },

            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

    // Clear cart
    await prisma.cartItem.deleteMany({
        where: {
            cart: {
                userId,
            },
        },
    });

    return {
        confirmed,
        order,
    };
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