// features/buyer-profile/schemas/buyer-profile.schema.ts
//
// NOTE: this supersedes any earlier "profileSchema" (name/email) and
// "changePasswordSchema" you may have — those were built against a
// dto shape ({name, email}) that doesn't match the real
// BuyerProfileService.updateProfile(), which only ever touches
// firstName/lastName (email isn't editable through this endpoint at all).
import { z } from "zod";

// ─── Update Profile (firstName / lastName only) ─────────────────────────────
export const UpdateBuyerProfileSchema = z.object({
  firstName: z.string().min(2, "Naam kam az kam 2 characters ka ho").max(40).optional(),
  lastName: z.string().min(2, "Naam kam az kam 2 characters ka ho").max(40).optional(),
});

export type UpdateBuyerProfileFormData = z.infer<typeof UpdateBuyerProfileSchema>;

// ─── Change Password ─────────────────────────────────────────────────────────
export const ChangeBuyerPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password daalna zaroori hai"),
    newPassword: z
      .string()
      .min(8, "Password kam az kam 8 characters ka hona chahiye")
      .regex(/[A-Z]/, "Kam az kam ek capital letter zaroori hai")
      .regex(/[0-9]/, "Kam az kam ek number zaroori hai")
      .regex(/[^A-Za-z0-9]/, "Kam az kam ek special character (@, $, #, etc.) zaroori hai"),
    confirmPassword: z.string().min(1, "Password confirm karna zaroori hai"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Naya password purane password se mukhtalif hona chahiye",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords match nahi kar rahe hain",
    path: ["confirmPassword"],
  });

export type ChangeBuyerPasswordFormData = z.infer<typeof ChangeBuyerPasswordSchema>;

// ─── Address (create + partial update) ───────────────────────────────────────
// Max 5 addresses per buyer, first one auto-becomes default — both enforced
// server-side (BuyerProfileService.addAddress), not re-validated here.
export const CreateAddressSchema = z.object({
  label: z.string().max(30, "Label 30 characters se ziada nahi").optional(),
  fullName: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  address1: z.string().min(1, "Address zaroori hai").max(120),
  address2: z.string().max(120).optional(),
  city: z.string().min(1, "City zaroori hai").max(60),
  state: z.string().min(1, "State/Province zaroori hai").max(60),
  postalCode: z.string().min(1, "Postal code zaroori hai").max(20),
  country: z.string().max(60).optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressFormData = z.infer<typeof CreateAddressSchema>;

export const UpdateAddressSchema = CreateAddressSchema.partial();
export type UpdateAddressFormData = z.infer<typeof UpdateAddressSchema>;