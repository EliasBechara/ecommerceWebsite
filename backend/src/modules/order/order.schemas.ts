import z from 'zod';

export const createOrderSchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.string().uuid('Invalid product ID'),
                quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99),
            }),
        )
        .min(1, 'Order must have at least one item'),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderIdSchema = z.object({
    orderId: z.string().uuid('Invalid order ID'),
});
export type OrderIdInput = z.infer<typeof orderIdSchema>;

export const updateOrderStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
        message: 'Invalid order status',
    }),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;