// features/admin-auth/types/admin-auth.types.ts
import { z } from "zod";
import {
  AdminLoginSchema,
  VerifyTwoFactorSetupSchema,
  VerifyTwoFactorLoginSchema,
  DisableTwoFactorSchema,
} from "../schemas/admin-auth.schema";

export type AdminLoginPayload = z.infer<typeof AdminLoginSchema>;
export type VerifyTwoFactorSetupPayload = z.infer<typeof VerifyTwoFactorSetupSchema>;
export type VerifyTwoFactorLoginPayload = z.infer<typeof VerifyTwoFactorLoginSchema>;
export type DisableTwoFactorPayload = z.infer<typeof DisableTwoFactorSchema>;