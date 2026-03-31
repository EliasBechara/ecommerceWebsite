import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../../auth.routes';
import { prisma } from '../../../../lib/prisma';

// ─────────────────────────────────────────────────────────────
// Test App Setup
// ─────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

// ─────────────────────────────────────────────────────────────
// Shared Fixtures & Helpers
// ─────────────────────────────────────────────────────────────
const VALID_PASSWORD = 'securepassword123';

async function cleanupTestUsers() {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'testuser',
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// POST /auth/register Tests
// ─────────────────────────────────────────────────────────────
describe('POST /auth/register (Integration)', () => {
  beforeAll(async () => {
    await cleanupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  beforeEach(async () => {
    await cleanupTestUsers();
  });

  it('creates a new user in the database and returns 201 with id and email', async () => {
    const uniqueEmail = `register-${Date.now()}@example.com`;

    const res = await request(app)
      .post('/auth/register')
      .send({ email: uniqueEmail, password: VALID_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      email: uniqueEmail,
    });
    expect(res.body).not.toHaveProperty('password');

    const createdUser = await prisma.user.findUnique({
      where: { email: uniqueEmail },
    });

    expect(createdUser).toBeTruthy();
    expect(createdUser?.password).not.toBe(VALID_PASSWORD);
    expect(createdUser?.email).toBe(uniqueEmail);
  });

  it('returns 409 when the email is already registered', async () => {
    const uniqueEmail = `conflict-${Date.now()}@example.com`;

    // First registration (should succeed)
    await request(app)
      .post('/auth/register')
      .send({ email: uniqueEmail, password: VALID_PASSWORD });

    // Second registration with same email (should fail)
    const res = await request(app)
      .post('/auth/register')
      .send({ email: uniqueEmail, password: VALID_PASSWORD });

    expect(res.status).toBe(409);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /auth/login Tests
// ─────────────────────────────────────────────────────────────
describe('POST /auth/login (Integration)', () => {
  let testUserEmail: string;
  let testUserId: string;

  beforeAll(async () => {
    await cleanupTestUsers();

    testUserEmail = `login-${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/auth/register')
      .send({ email: testUserEmail, password: VALID_PASSWORD });

    testUserId = registerRes.body.id;
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  it('returns 200, sets an httpOnly cookie, and returns user info on valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUserEmail, password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: testUserId,
      email: testUserEmail,
    });
    expect(res.body).not.toHaveProperty('token');

    const cookie: string = res.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toMatch(/token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('returns 401 for invalid credentials (wrong password)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUserEmail, password: 'wrongpassword123' });

    expect(res.status).toBe(401);
  });
});
