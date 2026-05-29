import { z } from 'zod'

const phoneNumber = z
    .string()
    .trim()
    .nullish() // Explicitly allows null or undefined safely
    .or(z.literal('')) // Explicitly allows empty strings from HTML inputs
    .refine(
        (val) => {
            // If it's falsy (undefined, null, or empty string), it passes cleanly
            if (!val) return true;
            // Otherwise, validate the strict format
            return /^\+55\s\d{2}\s\d{5}-\d{4}$/.test(val);
        },
        {
            message: 'Use format: +55 11 99999-9999',
        }
    )

export const addressSchema = z.object({
    recipientName: z
        .string()
        .trim()
        .min(1, 'Recipient name is required'),

    phoneNumber:
        phoneNumber,



    street: z
        .string()
        .trim()
        .min(1, 'Street is required'),

    number: z
        .string()
        .trim()
        .min(1, 'Number is required'),

    complement: z
        .string()
        .trim()
        .optional(),

    district: z
        .string()
        .trim()
        .min(1, 'District is required'),

    city: z
        .string()
        .trim()
        .min(1, 'City is required'),

    state: z
        .string()
        .trim()
        .min(1, 'State is required')
        .max(2, 'Use 2 letters'),

    zipCode: z
        .string()
        .trim()
        .min(1, 'ZIP code is required'),
})

export type AddressFormValues =
    z.infer<typeof addressSchema>