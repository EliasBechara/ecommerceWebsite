/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from 'vitest';
import request from 'supertest';
import checkoutRouter from '../../checkout.routes';
import { prisma } from '../../../../lib/prisma';
import { createTestApp } from '../../../../test/setup/createTestApp';
import { cleanDatabase } from '../../../../test/setup/testDb';
import { createUser } from '../../../../test/setup/factories/user.factory';

// ─────────────────────────────────────────
// Mock Protect Middleware
// ─────────────────────────────────────────
const mockUser = vi.hoisted(() => ({ id: '' }));

vi.mock('../../../../middleware/protect', () => ({
    protect: (req: any, _res: any, next: any) => {
        req.user = { id: mockUser.id };
        next();
    },
}));

// ─────────────────────────────────────────
// Test App Setup
// ─────────────────────────────────────────

const app = createTestApp(checkoutRouter, '/checkout');


// ─────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────
let user: any;
let cart: any;
let product1: any;
let product2: any;

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
    await cleanDatabase();

    user = await createUser();

    mockUser.id = user.id;

    cart = await prisma.cart.create({
        data: {
            userId: user.id,
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
            stock: 5,
        },
    });

    await prisma.cartItem.createMany({
        data: [
            { cartId: cart.id, productId: product1.id, quantity: 2, price: 500 },
            { cartId: cart.id, productId: product2.id, quantity: 1, price: 1000 },
        ],
    });
});

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────
describe('POST /checkout', () => {
    it('should create checkout session', async () => {
        const res = await request(app)
            .post('/checkout');

        expect(res.status).toBe(201);

        expect(res.body).toMatchObject({
            userId: user.id,
            status: 'PENDING',
        });

        expect(res.body.items).toHaveLength(2);
    });

    it('should return 400 if cart is empty', async () => {
        await prisma.cartItem.deleteMany();

        const res = await request(app)
            .post('/checkout');

        expect(res.status).toBe(400);

        expect(res.body.message).toBe(
            'Your cart is empty',
        );
    });
});

describe('GET /checkout/:sessionId', () => {
    it('should return checkout session', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'PENDING',
                expiresAt: new Date(
                    Date.now() + 1000 * 60 * 30,
                ),
            },
        });

        const res = await request(app)
            .get(`/checkout/${session.id}`);

        expect(res.status).toBe(200);

        expect(res.body).toMatchObject({
            id: session.id,
            userId: user.id,
            status: 'PENDING',
        });
    });

    it('should return 404 if session does not exist', async () => {
        const res = await request(app)
            .get('/checkout/550e8400-e29b-41d4-a716-446655440000');

        expect(res.status).toBe(404);

        expect(res.body.message).toBe(
            'Checkout session not found',
        );
    });
});

describe('PATCH /checkout/:sessionId/address', () => {
    it('should update address successfully', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'PENDING',
                expiresAt: new Date(
                    Date.now() + 1000 * 60 * 30,
                ),
            },
        });

        const res = await request(app)
            .patch(
                `/checkout/${session.id}/address`,
            )
            .send({
                address: {
                    fullName: 'Elias',
                    phone: '999999999',
                    street: 'Street',
                    number: '123',
                    city: 'Sao Paulo',
                    state: 'SP',
                    zipCode: '00000000',
                },
            });

        expect(res.status).toBe(200);

        expect(res.body.address).toMatchObject({
            city: 'Sao Paulo',
        });
    });

    it('should return 400 for invalid body', async () => {
        const session = await prisma.checkoutSession.create({
            data: {
                userId: user.id,
                status: 'PENDING',
                expiresAt: new Date(
                    Date.now() + 1000 * 60 * 30,
                ),
            },
        });

        const res = await request(app)
            .patch(
                `/checkout/${session.id}/address`,
            )
            .send({
                address: {},
            });

        expect(res.status).toBe(400);
    });
});

describe('GET /checkout/:sessionId/summary', () => {
    it('should calculate checkout summary', async () => {
        const session = await request(app)
            .post('/checkout');

        const res = await request(app)
            .get(
                `/checkout/${session.body.id}/summary`,
            );

        expect(res.status).toBe(200);

        expect(res.body).toMatchObject({
            sessionId: session.body.id,
            itemsTotal: 2000,
            shippingCost: 0,
            total: 2000,
        });
    });
});

describe('POST /checkout/:sessionId/confirm', () => {
    it('should confirm checkout successfully', async () => {
        const sessionResponse = await request(app)
            .post('/checkout');

        const sessionId = sessionResponse.body.id;

        await request(app)
            .patch(
                `/checkout/${sessionId}/address`,
            )
            .send({
                address: {
                    fullName: 'Elias',
                    phone: '999999999',
                    street: 'Street',
                    number: '123',
                    city: 'Sao Paulo',
                    state: 'SP',
                    zipCode: '00000000',
                },
            });

        const res = await request(app)
            .post(
                `/checkout/${sessionId}/confirm`,
            );

        expect(res.status).toBe(200);

        expect(res.body.status).toBe(
            'CONFIRMED',
        );

        const updatedProduct1 =
            await prisma.product.findUnique({
                where: {
                    id: product1.id,
                },
            });

        const updatedProduct2 =
            await prisma.product.findUnique({
                where: {
                    id: product2.id,
                },
            });

        expect(updatedProduct1?.stock).toBe(8);
        expect(updatedProduct2?.stock).toBe(4);
    });

    it('should return 400 if address is missing', async () => {
        const sessionResponse = await request(app)
            .post('/checkout');

        const sessionId = sessionResponse.body.id;

        const res = await request(app)
            .post(
                `/checkout/${sessionId}/confirm`,
            );

        expect(res.status).toBe(400);

        expect(res.body.message).toBe(
            'Delivery address is required before confirming',
        );
    });

    it('should clear cart after confirmation', async () => {
        const sessionResponse = await request(app)
            .post('/checkout');

        const sessionId = sessionResponse.body.id;

        await request(app)
            .patch(
                `/checkout/${sessionId}/address`,
            )
            .send({
                address: {
                    fullName: 'Elias',
                    phone: '999999999',
                    street: 'Street',
                    number: '123',
                    city: 'Sao Paulo',
                    state: 'SP',
                    zipCode: '00000000',
                },
            });

        await request(app)
            .post(
                `/checkout/${sessionId}/confirm`,
            );

        const remainingCartItems =
            await prisma.cartItem.findMany({
                where: {
                    cart: {
                        userId: user.id,
                    },
                },
            });

        expect(remainingCartItems).toHaveLength(
            0,
        );
    });
});

describe('PATCH /checkout/:sessionId/expire', () => {
    it('should expire checkout session', async () => {
        const sessionResponse = await request(app)
            .post('/checkout');

        const sessionId = sessionResponse.body.id;

        const res = await request(app)
            .patch(
                `/checkout/${sessionId}/expire`,
            );

        expect(res.status).toBe(200);

        expect(res.body.status).toBe(
            'EXPIRED',
        );
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});