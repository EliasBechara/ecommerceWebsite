/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import request from 'supertest';
import orderRouter from '../order.routes';
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
const app = createTestApp(orderRouter, '/orders');

// ─────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────
let user: any;
let product1: any;
let product2: any;

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
    await cleanDatabase();

    user = await createUser();
    mockUserId = user.id;

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

describe('POST /orders', () => {
    it('should create an order successfully', async () => {
        const res = await request(app)
            .post('/orders')
            .send({
                items: [
                    { productId: product1.id, quantity: 2 },
                    { productId: product2.id, quantity: 1 },
                ],
            });

        expect(res.status).toBe(201);
        expect(res.body.userId).toBe(user.id);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.total).toBe(2000); // 500*2 + 1000*1
        expect(res.body.items).toHaveLength(2);
    });

    it('should return 404 if a product does not exist', async () => {
        const res = await request(app)
            .post('/orders')
            .send({
                items: [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('One or more products were not found');
    });

    it('should return 400 if items array is empty', async () => {
        const res = await request(app)
            .post('/orders')
            .send({ items: [] });

        expect(res.status).toBe(400);
    });

    it('should return 400 if quantity is less than 1', async () => {
        const res = await request(app)
            .post('/orders')
            .send({
                items: [{ productId: product1.id, quantity: 0 }],
            });

        expect(res.status).toBe(400);
    });
});

describe('GET /orders/my-orders', () => {
    it('should return all orders for the authenticated user', async () => {
        await prisma.order.createMany({
            data: [
                { userId: user.id, total: 500, status: 'PENDING' },
                { userId: user.id, total: 1000, status: 'CONFIRMED' },
            ],
        });

        const res = await request(app).get('/orders/my-orders');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('should return an empty array if user has no orders', async () => {
        const res = await request(app).get('/orders/my-orders');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should not return orders from other users', async () => {
        const otherUser = await createUser();

        await prisma.order.create({
            data: { userId: otherUser.id, total: 999, status: 'PENDING' },
        });

        const res = await request(app).get('/orders/my-orders');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });
});


describe('GET /orders/:orderId', () => {
    it('should return the order if it belongs to the user', async () => {
        const order = await prisma.order.create({
            data: { userId: user.id, total: 500, status: 'PENDING' },
        });

        const res = await request(app).get(`/orders/${order.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(order.id);
        expect(res.body.userId).toBe(user.id);
    });

    it('should return 404 if order does not exist', async () => {
        const res = await request(app).get(
            '/orders/00000000-0000-0000-0000-000000000000',
        );

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Order not found');
    });

    it('should return 403 if order belongs to another user', async () => {
        const otherUser = await createUser();

        const order = await prisma.order.create({
            data: { userId: otherUser.id, total: 500, status: 'PENDING' },
        });

        const res = await request(app).get(`/orders/${order.id}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });
});

describe('PATCH /orders/:orderId/status', () => {
    it('should update the order status', async () => {
        const order = await prisma.order.create({
            data: { userId: user.id, total: 500, status: 'PENDING' },
        });

        const res = await request(app)
            .patch(`/orders/${order.id}/status`)
            .send({ status: 'CONFIRMED' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('CONFIRMED');
    });

    it('should return 404 if order does not exist', async () => {
        const res = await request(app)
            .patch('/orders/00000000-0000-0000-0000-000000000000/status')
            .send({ status: 'CONFIRMED' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Order not found');
    });

    it('should return 400 if order is already CANCELLED', async () => {
        const order = await prisma.order.create({
            data: { userId: user.id, total: 500, status: 'CANCELLED' },
        });

        const res = await request(app)
            .patch(`/orders/${order.id}/status`)
            .send({ status: 'CONFIRMED' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Cannot update a cancelled order');
    });

    it('should return 400 if status is invalid', async () => {
        const order = await prisma.order.create({
            data: { userId: user.id, total: 500, status: 'PENDING' },
        });

        const res = await request(app)
            .patch(`/orders/${order.id}/status`)
            .send({ status: 'INVALID_STATUS' });

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});