// features/buyer-profile/types/buyer-profile.types.ts
import { z } from "zod";
import {
  UpdateBuyerProfileSchema,
  ChangeBuyerPasswordSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
} from "../schemas/buyer-profile.schema";

export type UpdateBuyerProfilePayload = z.infer<typeof UpdateBuyerProfileSchema>;

// `confirmPassword` is form-only validation — never sent to the API.
export type ChangeBuyerPasswordPayload = Omit<
  z.infer<typeof ChangeBuyerPasswordSchema>,
  "confirmPassword"
>;

export type CreateAddressPayload = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressPayload = z.infer<typeof UpdateAddressSchema>;