import { z } from 'zod';

export const CreateAddressSchema = z.object({
  label: z.string().max(30).default('Home').optional(),

  fullName: z
    .string({ error: 'Full name is required' })
    .trim()
    .min(1, 'Full name is required')
    .max(80, 'Full name cannot exceed 80 characters'),

  phone: z
    .string({ error: 'Phone number is required' })
    .trim()
    .min(10, 'Phone number must be valid')
    .max(20),

  address1: z
    .string({ error: 'Address line 1 is required' })
    .trim()
    .min(5, 'Address line 1 is too short')
    .max(120),

  address2: z.string().trim().max(120).optional(),

  city: z
    .string({ error: 'City is required' })
    .trim()
    .min(2, 'City name is required')
    .max(60),

  state: z
    .string({ error: 'State is required' })
    .trim()
    .min(2, 'State name is required')
    .max(60),

  postalCode: z
    .string({ error: 'Postal code is required' })
    .trim()
    .min(3, 'Postal code is invalid')
    .max(20),

  country: z.string().trim().max(60).default('Pakistan').optional(),

  isDefault: z.boolean().default(false).optional(),
});

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;