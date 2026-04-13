import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import productsRouter from '../../products.routes';
import { prisma } from '../../../../lib/prisma';
import { Category } from '@prisma/client';
import { errorMiddleware } from '../../../../middleware/errorMiddleware';

// ─────────────────────────────────────────
// Test App Setup
// ─────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/products', productsRouter);

app.use(errorMiddleware);

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: 'RTX 5060',
        slug: 'rtx-5060',
        description: 'Entry-level 50-series GPU - Great for 1080p gaming',
        price: 299.99,
        category: Category.GPU,
        image: '/images/rtx5060.png',
        stock: 20,
      },
      {
        name: 'RTX 5070',
        slug: 'rtx-5070',
        description: 'Mid-range 50-series GPU - Excellent 1440p performance',
        price: 549.99,
        category: Category.GPU,
        image: '/images/rtx5070.png',
        stock: 14,
      },
      {
        name: 'RTX 5080',
        slug: 'rtx-5080',
        description: 'High-end 50-series GPU - Powerful 4K gaming',
        price: 999.99,
        category: Category.GPU,
        image: '/images/rtx5080.png',
        stock: 6,
      },
    ],
  });
});

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────
describe('GET /products/category/:category', () => {
  it('should return products for a valid category', async () => {
    const category = Category.GPU;

    const res = await request(app).get(`/products/category/${category}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    // partial match (safe against extra fields like id, createdAt)
    expect(res.body[0]).toMatchObject({
      category: Category.GPU,
    });
  });

  it('should return an empty array when no products exist', async () => {
    await prisma.product.deleteMany();

    const category = Category.GPU;

    const res = await request(app).get(`/products/category/${category}`);

    expect(res.status).toBe(200);

    expect(res.body).toEqual([]);
  });

  it('should return 400 for an invalid category', async () => {
    const res = await request(app).get('/products/category/INVALID');

    expect(res.status).toBe(400);

    expect(res.body).toMatchObject({
      message: expect.any(String),
    });
  });
});

describe('GET /products/search', () => {
  it('should return products matching the query', async () => {
    const res = await request(app).get('/products/search/').query({ q: 'rtx' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    // partial match (safe against extra fields like id, createdAt)
    expect(res.body[0]).toMatchObject({
      category: Category.GPU,
    });
  });

  it('should be case insensitive', async () => {
    const res = await request(app).get('/products/search/').query({ q: 'RTX' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    // partial match (safe against extra fields like id, createdAt)
    expect(res.body[0]).toMatchObject({
      category: Category.GPU,
    });
  });

  it('should return 400 when query is empty', async () => {
    const res = await request(app).get('/products/search/').query({ q: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('should return an empty array when no products match', async () => {
    const res = await request(app)
      .get('/products/search')
      .query({ q: 'zzzzzzzzzzzzzzzzzzzzzzzz' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('/GET /products/:slug', () => {
  it('should return a product for a valid slug', async () => {
    const slug = 'rtx-5080';

    const res = await request(app).get(`/products/${slug}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'RTX 5080',
      slug: 'rtx-5080',
      description: 'High-end 50-series GPU - Powerful 4K gaming',
      price: 999.99,
      category: Category.GPU,
      image: '/images/rtx5080.png',
      stock: 6,
    });
  });
  it('should return 404 when product is not found', async () => {
    const slug = 'zzzzzzzzzzzzzzzzzzzz';

    const res = await request(app).get(`/products/${slug}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not Found');
  });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
  await prisma.$disconnect();
});
