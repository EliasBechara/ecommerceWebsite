import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { loginUser, registerUser } from './auth.service';

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await registerUser({ email, password });

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const {
      token,
      id,
      email: userEmail,
    } = await loginUser({ email, password });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ id, email: userEmail, message: 'Login successful' });
  },
);
