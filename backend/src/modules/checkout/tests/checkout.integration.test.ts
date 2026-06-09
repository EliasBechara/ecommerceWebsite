/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import checkoutRouter from '../checkout.routes';
import { prisma } from '../../../lib/prisma';
import { createTestApp } from '../../../test/setup/createTestApp';
import { cleanDatabase } from '../../../test/setup/testDb';
import { createUser } from '../../../test/setup/factories/user.factory';

let mockUserId = '';

vi.mock('../../../middleware/protect', () => ({
    protect: (req: any, _res: any, next: any) => {
        req.user = { id: mockUserId };
        next();
    },
}));

// ─────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────
const app = createTestApp(checkoutRouter, '/checkout');

// ─────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────
let user: any;
let cart: any;
let address: any;
let product1: any;
let product2: any;

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
    await cleanDatabase();

    user = await createUser();
    mockUserId = user.id;

    cart = await prisma.cart.create({
        data: { userId: user.id },
    });

    address = await prisma.address.create({
        data: {
            userId: user.id,
            recipientName: 'John Doe',
            phoneNumber: '11999999999',
            street: 'Rua das Flores',
            number: '123',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
        },
    });

    product1 = await prisma.product.create({
        data: {
            name: 'RTX 5070',
            slug: 'rtx-5070',
            description: 'GPU',
            image: '/gpu.png',
            category: 'GPU',
            price: 500,
            stock: 10,
        },
    });

    product2 = await prisma.product.create({
        data: {
            name: 'RTX 5080',
            slug: 'rtx-5080',
            description: 'GPU',
            image: '/gpu2.png',
            category: 'GPU',
            price: 1000,
            stock: 2,
        },
    });
});

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const seedSessionWithItems = async (
    items: { productId: string; quantity: number; unitPrice: number }[],
) => {
    const session = await prisma.checkoutSession.create({
        data: {
            userId: user.id,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            paymentIntentId: null,
            addressId: address.id,
            items: {
                create: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                })),
            },
        },
    });

    return session;
};



describe('POST /checkout', () => {
    it('should create a checkout session from a valid cart', async () => {
        await prisma.cartItem.createMany({
            data: [
                { cartId: cart.id, productId: product1.id, quantity: 2, price: 500 },
                { cartId: cart.id, productId: product2.id, quantity: 1, price: 1000 },
            ],
        });

        const res = await request(app).post('/checkout');

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.items).toHaveLength(2);
    });

    it('should return 400 if cart is empty', async () => {
        const res = await request(app).post('/checkout');

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Your cart is empty');
    });

    it('should return 409 if a product has insufficient stock', async () => {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product2.id,
                quantity: 99,
                price: 1000,
            },
        });

        const res = await request(app).post('/checkout');

        expect(res.status).toBe(409);
        expect(res.body.message).toContain('Insufficient stock');
    });
});




describe('GET /checkout/:sessionId', () => {
    it('should return the checkout session', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app).get(`/checkout/${session.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(session.id);
        expect(res.body.status).toBe('PENDING');
    });

    it('should return 404 if session does not exist', async () => {
        const res = await request(app).get(
            '/checkout/00000000-0000-0000-0000-000000000000',
        );

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Checkout session not found');
    });

    it('should return 403 if session belongs to another user', async () => {
        const otherUser = await createUser();
        const session = await prisma.checkoutSession.create({
            data: {
                userId: otherUser.id,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                paymentIntentId: null,
            },
        });

        const res = await request(app).get(`/checkout/${session.id}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });

    it('should return 410 if session is expired', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'EXPIRED',
                expiresAt: new Date(Date.now() - 1000),
                paymentIntentId: null,
            },
        });

        const res = await request(app).get(`/checkout/${session.id}`);

        expect(res.status).toBe(410);
        expect(res.body.message).toBe('Session has expired');
    });

    it('should return 400 if sessionId is not a valid uuid', async () => {
        const res = await request(app).get('/checkout/not-a-uuid');

        expect(res.status).toBe(400);
    });
});




describe('PATCH /checkout/:sessionId/address', () => {
    it('should update the delivery address', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app)
            .patch(`/checkout/${session.id}/address`)
            .send({ addressId: address.id });

        expect(res.status).toBe(200);
        expect(res.body.addressId).toBe(address.id);
    });

    it('should return 404 if address does not exist', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app)
            .patch(`/checkout/${session.id}/address`)
            .send({ addressId: '00000000-0000-0000-0000-000000000000' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Address not found');
    });

    it('should return 403 if address belongs to another user', async () => {
        const otherUser = await createUser();
        const otherAddress = await prisma.address.create({
            data: {
                userId: otherUser.id,
                recipientName: 'Jane Doe',
                phoneNumber: '11888888888',
                street: 'Av. Paulista',
                number: '1',
                district: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-200',
            },
        });

        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app)
            .patch(`/checkout/${session.id}/address`)
            .send({ addressId: otherAddress.id });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });

    it('should return 400 if addressId is missing', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app)
            .patch(`/checkout/${session.id}/address`)
            .send({});

        expect(res.status).toBe(400);
    });

    it('should return 400 if sessionId is not a valid uuid', async () => {
        const res = await request(app)
            .patch('/checkout/not-a-uuid/address')
            .send({ addressId: address.id });

        expect(res.status).toBe(400);
    });
});




describe('GET /checkout/:sessionId/summary', () => {
    it('should return summary with shipping cost when total <= 200', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 100 },
        ]);

        const res = await request(app).get(`/checkout/${session.id}/summary`);

        expect(res.status).toBe(200);
        expect(res.body.itemsTotal).toBe(100);
        expect(res.body.shippingCost).toBe(15);
        expect(res.body.total).toBe(115);
    });

    it('should return summary with free shipping when total > 200', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app).get(`/checkout/${session.id}/summary`);

        expect(res.status).toBe(200);
        expect(res.body.itemsTotal).toBe(500);
        expect(res.body.shippingCost).toBe(0);
        expect(res.body.total).toBe(500);
    });

    it('should return 404 if session does not exist', async () => {
        const res = await request(app).get(
            '/checkout/00000000-0000-0000-0000-000000000000/summary',
        );

        expect(res.status).toBe(404);
    });

    it('should return 400 if sessionId is not a valid uuid', async () => {
        const res = await request(app).get('/checkout/not-a-uuid/summary');

        expect(res.status).toBe(400);
    });
});




describe('POST /checkout/:sessionId/confirm', () => {
    it('should confirm checkout, decrement stock, and clear cart', async () => {
        await prisma.cartItem.createMany({
            data: [
                { cartId: cart.id, productId: product1.id, quantity: 2, price: 500 },
            ],
        });

        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 2, unitPrice: 500 },
        ]);

        const res = await request(app).post(`/checkout/${session.id}/confirm`);

        expect(res.status).toBe(200);
        expect(res.body.confirmed.status).toBe('CONFIRMED');
        expect(res.body.order).toBeDefined();

        const updatedProduct = await prisma.product.findUnique({
            where: { id: product1.id },
        });
        expect(updatedProduct!.stock).toBe(8);

        const cartItems = await prisma.cartItem.findMany({
            where: { cart: { userId: user.id } },
        });
        expect(cartItems).toHaveLength(0);
    });

    it('should return 400 if no address is set', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                paymentIntentId: null,
                items: {
                    create: [
                        { productId: product1.id, quantity: 1, unitPrice: 500 },
                    ],
                },
            },
        });

        const res = await request(app).post(`/checkout/${session.id}/confirm`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe(
            'Delivery address is required before confirming',
        );
    });

    it('should return 409 if stock is insufficient at confirm time', async () => {
        await prisma.product.update({
            where: { id: product1.id },
            data: { stock: 0 },
        });

        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 2, unitPrice: 500 },
        ]);

        const res = await request(app).post(`/checkout/${session.id}/confirm`);

        expect(res.status).toBe(409);
        expect(res.body.message).toContain('Insufficient stock');
    });

    it('should return 410 if session is expired', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'EXPIRED',
                expiresAt: new Date(Date.now() - 1000),
                paymentIntentId: null,
            },
        });

        const res = await request(app).post(`/checkout/${session.id}/confirm`);

        expect(res.status).toBe(410);
        expect(res.body.message).toBe('Session has expired');
    });

    it('should return 409 if session is already confirmed', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'CONFIRMED',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                paymentIntentId: 'pi_already',
            },
        });

        const res = await request(app).post(`/checkout/${session.id}/confirm`);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Session already confirmed');
    });

    it('should return 400 if sessionId is not a valid uuid', async () => {
        const res = await request(app).post('/checkout/not-a-uuid/confirm');

        expect(res.status).toBe(400);
    });
});




describe('PATCH /checkout/:sessionId/expire', () => {
    it('should expire a pending session', async () => {
        const session = await seedSessionWithItems([
            { productId: product1.id, quantity: 1, unitPrice: 500 },
        ]);

        const res = await request(app).patch(`/checkout/${session.id}/expire`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('EXPIRED');
    });

    it('should return 404 if session does not exist', async () => {
        const res = await request(app).patch(
            '/checkout/00000000-0000-0000-0000-000000000000/expire',
        );

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Checkout session not found');
    });

    it('should return 403 if session belongs to another user', async () => {
        const otherUser = await createUser();
        const session = await prisma.checkoutSession.create({
            data: {
                userId: otherUser.id,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                paymentIntentId: null,
            },
        });

        const res = await request(app).patch(`/checkout/${session.id}/expire`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });

    it('should return 410 if session is already expired', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'EXPIRED',
                expiresAt: new Date(Date.now() - 1000),
                paymentIntentId: null,
            },
        });

        const res = await request(app).patch(`/checkout/${session.id}/expire`);

        expect(res.status).toBe(410);
        expect(res.body.message).toBe('Session has expired');
    });

    it('should return 409 if session is already confirmed', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'CONFIRMED',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                paymentIntentId: 'pi_done',
            },
        });

        const res = await request(app).patch(`/checkout/${session.id}/expire`);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Session already confirmed');
    });

    it('should return 400 if sessionId is not a valid uuid', async () => {
        const res = await request(app).patch('/checkout/not-a-uuid/expire');

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});