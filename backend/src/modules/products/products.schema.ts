import { Category } from '@prisma/client';
import z from 'zod';

export const slugSchema = z.object({
  slug: z.string().min(4).max(90),
});

export type SlugInput = z.infer<typeof slugSchema>;

export const searchForProductsSchema = z.object({
  q: z
    .string()
    .min(3, 'Search query must be at least 3 characters')
    .max(50, 'Search query must be at most 50 characters')
    .trim()
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Search query contains invalid characters'),
});

export type SearchForProductsInput = z.infer<typeof searchForProductsSchema>;

export const getProductsByCategorySchema = z.object({
  category: z.enum(Object.values(Category) as [Category, ...Category[]], {
    message: 'Invalid category',
  }),
});

export type GetProductsInput = z.infer<typeof getProductsByCategorySchema>;
