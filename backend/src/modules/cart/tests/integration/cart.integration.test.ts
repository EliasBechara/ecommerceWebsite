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
import cartRouter from '../../cart.routes';
import { prisma } from '../../../../lib/prisma';
import { createTestApp } from '../../../../test/setup/createTestApp';
import { cleanDatabase } from '../../../../test/setup/testDb';
import { createUser } from '../../../../test/setup/factories/user.factory';


let mockUserId = '';

vi.mock('../../../../middleware/protect', () => ({
    protect: (req: any, _res: any, next: any) => {
        req.user = { id: mockUserId };
        next();
    },
}));

// ─────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────
const app = createTestApp(cartRouter, '/cart');

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

    mockUserId = user.id;

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
            stock: 2,
        },
    });
});

describe('GET /cart/me', () => {
    it('should return user cart', async () => {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product1.id,
                quantity: 2,
                price: 500,
            },
        });

        const res = await request(app).get('/cart/me');

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(1);
    });
});


describe('POST /cart/merge', () => {
    it('should merge guest cart', async () => {
        const res = await request(app)
            .post('/cart/merge')
            .send({
                items: [
                    { productId: product1.id, quantity: 2 },
                    { productId: product2.id, quantity: 1 },
                ],
            });

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(2);
    });
});


describe('POST /cart/items/add', () => {
    it('should add item to cart', async () => {
        const res = await request(app)
            .post('/cart/items/add')
            .send({ productId: product1.id, quantity: 2 });

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].quantity).toBe(2);
    });

    it('should return 400 for insufficient stock', async () => {
        const res = await request(app)
            .post('/cart/items/add')
            .send({ productId: product2.id, quantity: 5 });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Insufficient stock');
    });
});

describe('DELETE /cart/items/delete/:productId', () => {
    it('should remove item from cart', async () => {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product1.id,
                quantity: 2,
                price: 500,
            },
        });

        const res = await request(app).delete(
            `/cart/items/delete/${product1.id}`,
        );

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(0);
    });

    it('should return 404 if item does not exist', async () => {
        const res = await request(app).delete(
            `/cart/items/delete/${product1.id}`,
        );

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Item not found in cart');
    });
});

describe('PATCH /cart/items/update/:productId', () => {
    it('should update item quantity', async () => {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product1.id,
                quantity: 1,
                price: 500,
            },
        });

        const res = await request(app)
            .patch(`/cart/items/update/${product1.id}`)
            .send({ quantity: 4 });

        expect(res.status).toBe(200);
        expect(res.body.items[0].quantity).toBe(4);
    });

    it('should return 400 if quantity is 0', async () => {
        const res = await request(app)
            .patch(`/cart/items/update/${product1.id}`)
            .send({ quantity: 0 });

        expect(res.status).toBe(400);
    });
});


describe('DELETE /cart', () => {
    it('should clear cart', async () => {
        await prisma.cartItem.createMany({
            data: [
                { cartId: cart.id, productId: product1.id, quantity: 2, price: 500 },
                { cartId: cart.id, productId: product2.id, quantity: 1, price: 1000 },
            ],
        });

        const res = await request(app).delete('/cart');

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(0);
    });
});


describe('POST /cart/checkout', () => {
    it('should verify cart successfully', async () => {
        await prisma.cartItem.createMany({
            data: [
                { cartId: cart.id, productId: product1.id, quantity: 2, price: 500 },
                { cartId: cart.id, productId: product2.id, quantity: 1, price: 1000 },
            ],
        });

        const res = await request(app).post('/cart/checkout');

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(2);
    });

    it('should return 400 if cart is empty', async () => {
        const res = await request(app).post('/cart/checkout');

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Cart is empty');
    });

    it('should return 400 if product price changed', async () => {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product1.id,
                quantity: 1,
                price: 100,
            },
        });

        const res = await request(app).post('/cart/checkout');

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Price changed');
    });

    it('should return 400 if stock is insufficient', async () => {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product1.id,
                quantity: 999,
                price: 500,
            },
        });

        const res = await request(app).post('/cart/checkout');

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Insufficient stock');
    });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
});