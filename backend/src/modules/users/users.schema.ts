import { z } from 'zod';


export const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    phoneNumber: z.string().trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


const addressLabel = z.enum(['HOME', 'WORK', 'OTHER']).optional();

export const createAddressSchema = z.object({
    label: addressLabel,

    recipientName: z
        .string()
        .min(3, 'Recipient name is required')
        .max(100, 'Recipient name is too long')
        .trim(),

    phoneNumber: z.string().trim().optional(),

    street: z
        .string()
        .min(5, 'Street is required')
        .max(150, 'Street is too long')
        .trim(),

    number: z
        .string()
        .min(1, 'Number is required')
        .max(20, 'Number is too long')
        .trim(),

    complement: z
        .string()
        .max(100, 'Complement is too long')
        .trim()
        .optional(),

    district: z
        .string()
        .min(4, 'District is required')
        .max(100, 'District is too long')
        .trim(),

    city: z
        .string()
        .min(1, 'City is required')
        .max(100, 'City is too long')
        .trim(),

    state: z
        .string()
        .min(2, 'State must have 2 characters')
        .max(2, 'State must have 2 characters')
        .toUpperCase()
        .trim(),

    zipCode: z
        .string()
        .regex(/^\d{5}-?\d{3}$/, 'Invalid Brazilian ZIP code'),

    country: z
        .string()
        .max(2, 'Country code must have 2 characters')
        .default('BR'),

    isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;