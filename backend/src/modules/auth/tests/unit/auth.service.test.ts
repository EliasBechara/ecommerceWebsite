/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginUser, registerUser } from '../../auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

// ─────────────────────────────────────────────────────────────
// Mocks Setup
// ─────────────────────────────────────────────────────────────
vi.mock('../../../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

// ─────────────────────────────────────────────────────────────
// Typed Mock References
// ─────────────────────────────────────────────────────────────
const mockedBcrypt = bcrypt as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

const mockedJwt = jwt as unknown as {
  sign: ReturnType<typeof vi.fn>;
};

const mockedPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

// ─────────────────────────────────────────────────────────────
// registerUser Tests
// ─────────────────────────────────────────────────────────────
describe('registerUser service function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue('fakeHashedPassword');
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue('fakeToken');
  });

  it('should throw if email or password is missing', async () => {
    await expect(
      registerUser({ email: '', password: '12345678' }),
    ).rejects.toThrow('Email and password are required');
  });

  it('should throw if password is too short', async () => {
    await expect(
      registerUser({ email: 'elias123@gmail.com', password: '123456' }),
    ).rejects.toThrow('Password must be at least 8 characters');
  });

  it('should throw if user already exists', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    await expect(
      registerUser({ email: 'test@test.com', password: '12345678' }),
    ).rejects.toThrow('User already exists');
  });

  it('should create a new user successfully', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const fakeUser = {
      id: '123',
      email: 'test@test.com',
      createdAt: new Date(),
    };

    mockedPrisma.user.create.mockResolvedValue(fakeUser);

    const result = await registerUser({
      email: 'test@test.com',
      password: '12345678',
    });

    expect(result).toEqual(fakeUser);
    expect(mockedBcrypt.hash).toHaveBeenCalledWith('12345678', 12);
    expect(mockedPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { email: 'test@test.com', password: 'fakeHashedPassword' },
        select: { id: true, email: true, createdAt: true },
      }),
    );
  });

  it('should normalize email before creating user', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const fakeUser = {
      id: '124',
      email: 'test@test.com',
      createdAt: new Date(),
    };

    mockedPrisma.user.create.mockResolvedValue(fakeUser);

    const result = await registerUser({
      email: '  TEST@TeSt.CoM  ',
      password: '12345678',
    });

    expect(result).toEqual(fakeUser);
    expect(mockedPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { email: 'test@test.com', password: 'fakeHashedPassword' },
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────
// loginUser Tests
// ─────────────────────────────────────────────────────────────
describe('loginUser service function', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue('fakeHashedPassword');
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue('fakeToken');
    process.env = { ...OLD_ENV, JWT_SECRET: 'testsecret' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should throw if email or password is missing', async () => {
    await expect(loginUser({ email: '', password: '123456' })).rejects.toThrow(
      'Missing field',
    );
  });

  it('should throw if user does not exist', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser({ email: 'testwrong@test.com', password: '12345678' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw if password is incorrect', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword123',
    });
    mockedBcrypt.compare.mockResolvedValue(false);

    await expect(
      loginUser({ email: 'test@test.com', password: 'wrongpassword' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;

    mockedPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword123',
    });
    mockedBcrypt.compare.mockResolvedValue(true);

    await expect(
      loginUser({ email: 'test@test.com', password: '12345678' }),
    ).rejects.toThrow('JWT_SECRET missing');
  });

  it('should successfully login and return token, id, email', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword123',
    });
    mockedBcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({
      email: 'test@test.com',
      password: '12345678',
    });

    expect(result).toEqual({
      token: 'fakeToken',
      id: '1',
      email: 'test@test.com',
    });

    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      '12345678',
      'hashedPassword123',
    );

    expect(mockedJwt.sign).toHaveBeenCalledWith({ id: '1' }, 'testsecret', {
      expiresIn: '1h',
    });
  });
});
