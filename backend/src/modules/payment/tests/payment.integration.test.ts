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
import paymentRouter from '../payment.routes';
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
const app = createTestApp(paymentRouter, '/payments');

// ─────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────
let user: any;
let order: any;

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
    await cleanDatabase();

    user = await createUser();
    mockUserId = user.id;

    const product = await prisma.product.create({
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

    order = await prisma.order.create({
        data: {
            userId: user.id,
            total: 1000,
            status: 'PENDING',
            items: {
                create: [{ productId: product.id, quantity: 2, unitPrice: 500 }],
            },
        },
    });
});

// ─────────────────────────────────────────
// POST /payments
// ─────────────────────────────────────────
describe('POST /payments', () => {
    it('should create a payment successfully', async () => {
        const res = await request(app)
            .post('/payments')
            .send({ orderId: order.id, method: 'PIX', currency: 'BRL' });

        expect(res.status).toBe(201);
        expect(res.body.orderId).toBe(order.id);
        expect(res.body.userId).toBe(user.id);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.method).toBe('PIX');
        expect(res.body.amount).toBe(1000);
        expect(res.body.providerReference).toBeDefined();
    });

    it('should return 404 if order does not exist', async () => {
        const res = await request(app)
            .post('/payments')
            .send({ orderId: '00000000-0000-0000-0000-000000000000', method: 'PIX', currency: 'BRL' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Order not found');
    });

    it('should return 403 if order belongs to another user', async () => {
        const otherUser = await createUser();
        const otherOrder = await prisma.order.create({
            data: { userId: otherUser.id, total: 500, status: 'PENDING' },
        });

        const res = await request(app)
            .post('/payments')
            .send({ orderId: otherOrder.id, method: 'PIX', currency: 'BRL' });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });

    it('should return 400 if order is CANCELLED', async () => {
        const cancelledOrder = await prisma.order.create({
            data: { userId: user.id, total: 500, status: 'CANCELLED' },
        });

        const res = await request(app)
            .post('/payments')
            .send({ orderId: cancelledOrder.id, method: 'PIX', currency: 'BRL' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Cannot pay for a cancelled order');
    });

    it('should return 409 if an active payment already exists', async () => {
        await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'PENDING',
                providerReference: 'mock_existing_ref',
            },
        });

        const res = await request(app)
            .post('/payments')
            .send({ orderId: order.id, method: 'BOLETO', currency: 'BRL' });

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('An active payment already exists for this order');
    });

    it('should return 400 if method is invalid', async () => {
        const res = await request(app)
            .post('/payments')
            .send({ orderId: order.id, method: 'CASH', currency: 'BRL' });

        expect(res.status).toBe(400);
    });

    it('should return 400 if orderId is not a valid UUID', async () => {
        const res = await request(app)
            .post('/payments')
            .send({ orderId: 'not-a-uuid', method: 'PIX', currency: 'BRL' });

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// PATCH /payments/:paymentId/confirm
// ─────────────────────────────────────────
describe('PATCH /payments/:paymentId/confirm', () => {
    it('should confirm a payment and set order status to CONFIRMED', async () => {
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'PENDING',
                providerReference: 'mock_ref_abc123',
            },
        });

        const res = await request(app)
            .patch(`/payments/${payment.id}/confirm`)
            .send({ paymentId: payment.id, providerReference: 'mock_ref_abc123' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('CONFIRMED');

        const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
        expect(updatedOrder?.status).toBe('CONFIRMED');
    });

    it('should return 404 if payment does not exist', async () => {
        const res = await request(app)
            .patch('/payments/00000000-0000-0000-0000-000000000000/confirm')
            .send({ paymentId: '00000000-0000-0000-0000-000000000000', providerReference: 'mock_ref' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Payment not found');
    });

    it('should return 400 if payment is already CONFIRMED', async () => {
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'CONFIRMED',
                providerReference: 'mock_ref_abc123',
            },
        });

        const res = await request(app)
            .patch(`/payments/${payment.id}/confirm`)
            .send({ paymentId: payment.id, providerReference: 'mock_ref_abc123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Payment is already confirmed');
    });

    it('should return 400 if payment is FAILED', async () => {
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'FAILED',
                providerReference: 'mock_ref_abc123',
            },
        });

        const res = await request(app)
            .patch(`/payments/${payment.id}/confirm`)
            .send({ paymentId: payment.id, providerReference: 'mock_ref_abc123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Cannot confirm a failed payment');
    });

    it('should return 400 if providerReference does not match', async () => {
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'PENDING',
                providerReference: 'mock_ref_correct',
            },
        });

        const res = await request(app)
            .patch(`/payments/${payment.id}/confirm`)
            .send({ paymentId: payment.id, providerReference: 'mock_ref_wrong' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Provider reference mismatch');
    });

    it('should return 400 if paymentId param is not a valid UUID', async () => {
        const res = await request(app)
            .patch('/payments/not-a-uuid/confirm')
            .send({ paymentId: 'not-a-uuid', providerReference: 'mock_ref' });

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// GET /payments/:paymentId/status
// ─────────────────────────────────────────
describe('GET /payments/:paymentId/status', () => {
    it('should return payment status for the authenticated user', async () => {
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'PENDING',
                providerReference: 'mock_ref_xyz',
            },
        });

        const res = await request(app).get(`/payments/${payment.id}/status`);

        expect(res.status).toBe(200);
        expect(res.body.paymentId).toBe(payment.id);
        expect(res.body.orderId).toBe(order.id);
        expect(res.body.status).toBe('PENDING');
        expect(res.body.method).toBe('PIX');
        expect(res.body.amount).toBe(1000);
        expect(res.body.currency).toBe('BRL');
    });

    it('should not expose providerReference in the response', async () => {
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: user.id,
                method: 'BOLETO',
                currency: 'BRL',
                amount: 1000,
                status: 'PENDING',
                providerReference: 'mock_secret_ref',
            },
        });

        const res = await request(app).get(`/payments/${payment.id}/status`);

        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty('providerReference');
    });

    it('should return 404 if payment does not exist', async () => {
        const res = await request(app).get(
            '/payments/00000000-0000-0000-0000-000000000000/status',
        );

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Payment not found');
    });

    it('should return 403 if payment belongs to another user', async () => {
        const otherUser = await createUser();
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: otherUser.id,
                method: 'PIX',
                currency: 'BRL',
                amount: 1000,
                status: 'PENDING',
                providerReference: 'mock_ref_other',
            },
        });

        const res = await request(app).get(`/payments/${payment.id}/status`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Forbidden');
    });

    it('should return 400 if paymentId is not a valid UUID', async () => {
        const res = await request(app).get('/payments/not-a-uuid/status');

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});