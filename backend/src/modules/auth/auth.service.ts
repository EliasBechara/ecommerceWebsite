import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

const SALT_ROUNDS = 12;

export interface RegisterUserResult {
  id: string;
  email: string;
  createdAt: Date;
}

export const registerUser = async (
  email: string,
  password: string,
): Promise<RegisterUserResult> => {
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
