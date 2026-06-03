import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { changePassword, findUserById, loginUser, registerUser } from './auth.service';
import { AppError } from '../../utils/AppError';
import { JwtPayload } from 'jsonwebtoken';

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
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ id, email: userEmail, message: 'Login successful' });
  },
);


export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.user as JwtPayload;
    if (!id) throw new AppError('Invalid token payload', 401);

    const user = await findUserById(id);
    res.status(200).json({ id: user.id, email: user.email });
  },
);

export const updatePasswordController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.user as JwtPayload;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!id) throw new AppError('Invalid token payload', 401);

  await changePassword({ userId: id, currentPassword, newPassword, confirmNewPassword })

  res.status(200).json({ message: 'Password Updated Successfully!' })
})