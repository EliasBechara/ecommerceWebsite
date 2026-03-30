import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export interface RegisterUserResult {
  id: string;
  email: string;
  createdAt: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export const registerUser = async (
  input: RegisterInput,
): Promise<RegisterUserResult> => {
  const { email, password } = input;

  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResult {
  token: string;
  id: string;
  email: string;
}

export const loginUser = async ({
  email,
  password,
}: LoginUserInput): Promise<LoginUserResult> => {
  if (!email || !password) {
    throw new AppError('Missing field', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');

  const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });

  return { token, id: user.id, email: user.email };
};
