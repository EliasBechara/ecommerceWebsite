import z from 'zod';

export const createPaymentSchema = z.object({
    orderId: z.string().uuid('Invalid order ID'),
    method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO'], {
        message: 'Invalid payment method',
    }),
    currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('BRL'),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const confirmPaymentSchema = z.object({
    paymentId: z.string().uuid('Invalid payment ID'),
    providerReference: z.string().min(1, 'Provider reference is required'),
});
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

export const paymentIdSchema = z.object({
    paymentId: z.string().uuid('Invalid payment ID'),
});
export type PaymentIdInput = z.infer<typeof paymentIdSchema>;