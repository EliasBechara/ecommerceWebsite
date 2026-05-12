import z from 'zod';

export const createSessionSchema = z.object({});

export const getSessionSchema = z.object({
    sessionId: z.uuid(),
});
export type GetSessionInput = z.infer<typeof getSessionSchema>;

export const updateAddressSchema = z.object({
    sessionId: z.uuid(),
    address: z.object({
        fullName: z.string().min(2).max(120),
        phone: z.string().min(8).max(20),
        street: z.string().min(3).max(120),
        number: z.string().min(1).max(20),
        city: z.string().min(2).max(80),
        state: z.string().min(2).max(80),
        zipCode: z.string().min(3).max(20),
    }),
});
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export const calculateSummarySchema = z.object({
    sessionId: z.uuid(),
});
export type CalculateSummaryInput = z.infer<typeof calculateSummarySchema>;

export const confirmCheckoutSchema = z.object({
    sessionId: z.uuid(),
});
export type ConfirmCheckoutInput = z.infer<typeof confirmCheckoutSchema>;

export const expireSessionSchema = z.object({
    sessionId: z.uuid(),
});
export type ExpireSessionInput = z.infer<typeof expireSessionSchema>;