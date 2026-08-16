import { z } from 'zod';

export const CreateBuyerAddressSchema = z.object({
  label: z.string().min(1).max(30).default('Home'),
  fullName: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  address1: z.string().min(1, 'Address line 1 is required').max(120),
  address2: z.string().max(120).optional(),
  city: z.string().min(1, 'City is required').max(60),
  state: z.string().min(1, 'State is required').max(60),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().max(60).default('Pakistan'),
  isDefault: z.boolean().default(false),
});

export const UpdateBuyerAddressSchema = CreateBuyerAddressSchema.partial();

export type CreateBuyerAddressDto = z.infer<typeof CreateBuyerAddressSchema>;
export type UpdateBuyerAddressDto = z.infer<typeof UpdateBuyerAddressSchema>;