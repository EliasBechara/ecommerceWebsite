import z from "zod";

export const cartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().min(0).max(5)
})

export const productIdSchema = z.object({
  productId: z.uuid()
})

export const quantitySchema = z.object({
  quantity: z.number().min(1).max(5)
})