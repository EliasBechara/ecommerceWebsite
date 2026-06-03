import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(40),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(40),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(40),
  newPassword: z.string().min(8).max(40),
  confirmNewPassword: z.string().min(8).max(40),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;