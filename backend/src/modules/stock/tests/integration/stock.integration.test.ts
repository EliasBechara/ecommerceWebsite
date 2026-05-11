import {
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
} from 'vitest';
import request from 'supertest';
import express from 'express';
import stockRouter from '../../stock.routes';
import { prisma } from '../../../../lib/prisma';
import { Category } from '@prisma/client';
import { errorMiddleware } from '../../../../middleware/errorMiddleware';

// ─────────────────────────────────────────
// Test App Setup
// ─────────────────────────────────────────
const app = express();

app.use(express.json());

app.use('/stock', stockRouter);

app.use(errorMiddleware);

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
    await prisma.product.deleteMany();

    await prisma.product.createMany({
        data: [
            {
                name: 'RTX 5070',
                slug: 'rtx-5070',
                description:
                    'Mid-range 50-series GPU',
                price: 549.99,
                category: Category.GPU,
                image: '/images/rtx5070.png',
                stock: 14,
            },

            {
                name: 'RTX 5080',
                slug: 'rtx-5080',
                description:
                    'High-end 50-series GPU',
                price: 999.99,
                category: Category.GPU,
                image: '/images/rtx5080.png',
                stock: 3,
            },
        ],
    });
});

describe('GET /stock/:slug/validate', () => {
    it('should validate available stock', async () => {
        const res = await request(app).get(
            '/stock/rtx-5070/validate?quantity=2',
        );

        expect(res.status).toBe(200);

        expect(res.body).toEqual({
            slug: 'rtx-5070',
            name: 'RTX 5070',
            stock: 14,
            requested: 2,
            isAvailable: true,
        });
    });

    it('should return unavailable when stock is insufficient', async () => {
        const res = await request(app).get(
            '/stock/rtx-5080/validate?quantity=10',
        );

        expect(res.status).toBe(200);

        expect(res.body).toEqual({
            slug: 'rtx-5080',
            name: 'RTX 5080',
            stock: 3,
            requested: 10,
            isAvailable: false,
        });
    });

    it('should return 404 when product does not exist', async () => {
        const res = await request(app).get(
            '/stock/invalid-product/validate?quantity=1',
        );

        expect(res.status).toBe(404);

        expect(res.body.message).toBe(
            'Product not found',
        );
    });

    it('should return 400 for invalid slug', async () => {
        const res = await request(app).get(
            '/stock/a/validate?quantity=1',
        );

        expect(res.status).toBe(400);

        expect(res.body.message).toBe(
            'Validation failed',
        );
    });
});

describe('PATCH /stock/:slug/decrement', () => {
    it('should decrement stock successfully', async () => {
        const res = await request(app)
            .patch('/stock/rtx-5070/decrement')
            .send({
                slug: 'rtx-5070',
                quantity: 4,
            });

        expect(res.status).toBe(200);

        expect(res.body).toMatchObject({
            slug: 'rtx-5070',
            name: 'RTX 5070',
            stock: 10,
        });

        const updatedProduct =
            await prisma.product.findUnique({
                where: {
                    slug: 'rtx-5070',
                },
            });

        expect(updatedProduct?.stock).toBe(10);
    });

    it('should return 409 when stock is insufficient', async () => {
        const res = await request(app)
            .patch('/stock/rtx-5080/decrement')
            .send({
                slug: 'rtx-5080',
                quantity: 10,
            });

        expect(res.status).toBe(409);

        expect(res.body.message).toBe(
            'Insufficient stock. Available: 3, requested: 10',
        );
    });

    it('should return 404 when product does not exist', async () => {
        const res = await request(app)
            .patch('/stock/invalid-product/decrement')
            .send({
                slug: 'invalid-product',
                quantity: 1,
            });

        expect(res.status).toBe(404);

        expect(res.body.message).toBe(
            'Product not found',
        );
    });

    it('should return 400 for invalid quantity', async () => {
        const res = await request(app)
            .patch('/stock/rtx-5070/decrement')
            .send({
                slug: 'rtx-5070',
                quantity: 0,
            });

        expect(res.status).toBe(400);

        expect(res.body.message).toBe(
            'Validation failed',
        );
    });
});

describe('Rate Limiter', () => {
    it('should block requests after limit is exceeded', async () => {
        const responses = await Promise.all(
            Array.from({ length: 31 }, () =>
                request(app).get(
                    '/stock/rtx-5070/validate?quantity=1',
                ),
            ),
        );

        const blockedResponse = responses[30];

        expect(blockedResponse.status).toBe(429);

        expect(blockedResponse.body).toEqual({
            message:
                'Too many stock requests, please try again later.',
        });
    });
});

describe('PATCH /stock/:slug/decrement edge cases', () => {
    it('should allow decrement when quantity equals stock', async () => {
        const res = await request(app)
            .patch('/stock/rtx-5080/decrement')
            .send({
                slug: 'rtx-5080',
                quantity: 3,
            });

        expect(res.status).toBe(200);

        expect(res.body).toMatchObject({
            slug: 'rtx-5080',
            stock: 0,
        });

        const updatedProduct =
            await prisma.product.findUnique({
                where: {
                    slug: 'rtx-5080',
                },
            });

        expect(updatedProduct?.stock).toBe(0);
    });

    it('should return 400 for invalid quantity type', async () => {
        const res = await request(app)
            .patch('/stock/rtx-5070/decrement')
            .send({
                slug: 'rtx-5070',
                quantity: 'abc',
            });

        expect(res.status).toBe(400);

        expect(res.body.message).toBe(
            'Validation failed',
        );
    });
});

describe('Concurrency / race condition', () => {
    it('should not oversell stock during concurrent requests', async () => {
        const responses = await Promise.all([
            request(app)
                .patch('/stock/rtx-5080/decrement')
                .send({
                    slug: 'rtx-5080',
                    quantity: 2,
                }),

            request(app)
                .patch('/stock/rtx-5080/decrement')
                .send({
                    slug: 'rtx-5080',
                    quantity: 2,
                }),
        ]);

        const successResponses = responses.filter(
            (res) => res.status === 200,
        );

        const failedResponses = responses.filter(
            (res) => res.status === 409,
        );

        // Ideally:
        // one succeeds
        // one fails

        expect(successResponses.length).toBe(1);

        expect(failedResponses.length).toBe(1);

        const updatedProduct =
            await prisma.product.findUnique({
                where: {
                    slug: 'rtx-5080',
                },
            });

        expect(updatedProduct?.stock).toBe(1);
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});