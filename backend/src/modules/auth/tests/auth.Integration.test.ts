import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import authRouter from '../auth.routes';
import { prisma } from '../../../lib/prisma';
import { createTestApp } from '../../../test/setup/createTestApp';
import { cleanDatabase } from '../../../test/setup/testDb';
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
const NEW_PASSWORD = 'newSecurePassword456';

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

describe('PATCH /auth/update-password', () => {
  let authCookie: string;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(VALID_PASSWORD, 1);

    await prisma.user.create({
      data: { email: VALID_EMAIL, password: hashedPassword },
    });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    authCookie = loginRes.headers['set-cookie']?.[0] ?? '';
  });

  it('should update the password and return 200 with a success message', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Password Updated Successfully!' });
  });

  it('should store the new password as a hash in the database', async () => {
    await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    const user = await prisma.user.findUnique({
      where: { email: VALID_EMAIL },
    });

    expect(user).toBeTruthy();
    expect(user?.password).not.toBe(NEW_PASSWORD);

    const isHashed = await bcrypt.compare(NEW_PASSWORD, user!.password);
    expect(isHashed).toBe(true);
  });

  it('should allow login with new password after update', async () => {
    await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: NEW_PASSWORD });

    expect(loginRes.status).toBe(200);
  });

  it('should reject login with the old password after update', async () => {
    await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    expect(loginRes.status).toBe(401);
  });

  it('should return 401 when currentPassword is wrong', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: 'wrongPassword99',
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(401);
  });

  it('should return 401 when no cookie is provided', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(401);
  });

  it('should return 401 when cookie token is invalid', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', 'token=invalidtoken')
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(401);
  });

  it('should return 400 when newPassword and confirmNewPassword do not match', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: 'doesNotMatch99',
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when newPassword is too short', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: 'short',
        confirmNewPassword: 'short',
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when currentPassword is missing', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when newPassword is missing', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when confirmNewPassword is missing', async () => {
    const res = await request(app)
      .patch('/auth/update-password')
      .set('Cookie', authCookie)
      .send({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────
afterAll(async () => {
  await prisma.$disconnect();
});