import { z } from 'zod'

// ─── Phone validation helper ──────────────────────────────────────────────────
const phoneRegex = /^\+?[1-9]\d{6,14}$/

export const ShippingAddressSchema = z.object({
  address1:   z.string().min(1, 'Address is required').max(120).trim(),
  address2:   z.string().max(120).trim().optional().default(''),
  city:       z.string().min(1, 'City is required').max(60).trim(),
  state:      z.string().min(1, 'State is required').max(60).trim(),
  postalCode: z.string().min(1, 'Postal code is required').max(20).trim(),
  country:    z.string().max(60).trim().optional().default('Pakistan'),
})

export const OrderItemSchema = z.object({
  product:        z.string().min(1, 'Product ID is required'),
  productName:    z.string().min(1),
  price:          z.number().positive().max(1_000_000),
  quantity:       z.number().int().min(1, 'Min 1').max(100, 'Max 100 per item'),
  isSubscription: z.boolean().optional().default(false),
})

export const CreatePaymentIntentSchema = z.object({
  customerName:  z.string().min(1).max(150).trim(),
  customerEmail: z.string().email('Invalid email').max(255).trim().toLowerCase(),
  customerPhone: z
    .string()
    .transform(v => v.replace(/[\s()\-]/g, ''))
    .refine(v => phoneRegex.test(v), 'Invalid phone number — include country code'),
  shippingAddress: ShippingAddressSchema,
  items:           z.array(OrderItemSchema).min(1, 'At least one item required'),
  orderNotes:      z.string().max(500).trim().optional().default(''),
  buyerId:         z.string().uuid().optional(),
})

export type CreatePaymentIntentDto = z.infer<typeof CreatePaymentIntentSchema>