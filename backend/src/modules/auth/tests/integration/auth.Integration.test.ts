import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import authRouter from '../../auth.routes';
import { prisma } from '../../../../lib/prisma';
import { createTestApp } from '../../../../test/setup/createTestApp';
import { cleanDatabase } from '../../../../test/setup/testDb';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────
// Test App Setup
// ─────────────────────────────────────────
const app = createTestApp(authRouter, '/auth');

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const VALID_EMAIL = 'elias@test.com';
const VALID_PASSWORD = 'securepassword123';

// ─────────────────────────────────────────
// DB Setup
// ─────────────────────────────────────────
beforeEach(async () => {
  await cleanDatabase();
});


describe('POST /auth/register', () => {
  it('should register a new user and return 201 with id and email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      email: VALID_EMAIL,
    });
    expect(res.body).not.toHaveProperty('password');
  });

  it('should hash the password stored in the database', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    const user = await prisma.user.findUnique({
      where: { email: VALID_EMAIL },
    });

    expect(user).toBeTruthy();
    expect(user?.password).not.toBe(VALID_PASSWORD);
  });

  it('should return 409 when email is already registered', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: VALID_EMAIL });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(VALID_PASSWORD, 10);

    await prisma.user.create({
      data: {
        email: VALID_EMAIL,
        password: hashedPassword,
      },
    });
  });

  it('should return 200 with user info on valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      email: VALID_EMAIL,
    });
    expect(res.body).not.toHaveProperty('password');
  });

  it('should set an httpOnly cookie on successful login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    const cookie: string = res.headers['set-cookie']?.[0] ?? '';

    expect(cookie).toMatch(/token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('should not return a token in the response body', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    expect(res.body).not.toHaveProperty('token');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'ghost@test.com', password: VALID_PASSWORD });

    expect(res.status).toBe(401);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: VALID_PASSWORD });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
  await prisma.$disconnect();
});