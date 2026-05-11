import z from 'zod';

export const stockSlugSchema = z.object({
    slug: z.string().min(4).max(90),
});
export type StockSlugInput = z.infer<typeof stockSlugSchema>;

export const decrementStockSchema = z.object({
    slug: z.string().min(4).max(90),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});
export type DecrementStockInput = z.infer<typeof decrementStockSchema>;