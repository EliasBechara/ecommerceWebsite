import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { registerUser } from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await registerUser(email, password);

  res.status(201).json({
    id: user.id,
    email: user.email,
  });
});
