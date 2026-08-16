import { z } from "zod";

export const CreateBuyerAddressSchema = z.object({
  label: z.string().min(1, "Label zaroori hai").max(30).default("Home"),
  fullName: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  address1: z.string().min(1, "Address Line 1 zaroori hai").max(120),
  address2: z.string().max(120).optional(),
  city: z.string().min(1, "City zaroori hai").max(60),
  state: z.string().min(1, "State zaroori hai").max(60),
  postalCode: z.string().min(1, "Postal code zaroori hai").max(20),
  country: z.string().max(60).default("Pakistan"),
  isDefault: z.boolean().default(false),
});

export const UpdateBuyerAddressSchema = CreateBuyerAddressSchema.partial();

export type CreateBuyerAddressPayload = z.input<typeof CreateBuyerAddressSchema>;
export type UpdateBuyerAddressPayload = z.infer<typeof UpdateBuyerAddressSchema>;