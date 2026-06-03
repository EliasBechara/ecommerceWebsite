import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import jwt from 'jsonwebtoken';
import { UpdatePasswordInput } from './auth.schemas';

const SALT_ROUNDS = 12;

interface RegisterUserResult {
  id: string;
  email: string;
  createdAt: Date;
}

interface RegisterInput {
  email: string;
  password: string;
}


interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserResult {
  token: string;
  id: string;
  email: string;
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

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
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

    await tx.cart.create({
      data: {
        userId: createdUser.id,
      },
    });

    return createdUser;
  });

  return user;
};


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

export const findUserById = async (
  userId: string,
): Promise<{ id: string; email: string }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) throw new AppError('User not found', 404);

  return user;
};


interface ChangePasswordInput extends UpdatePasswordInput {
  userId: string;
}

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const hashedUpdatedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedUpdatedPassword },
  });

  return { success: true };
};