// features/auth/schemas/password-reset.schema.ts
//
// FIX: the previous resetPasswordSchema had no `token` field at all and
// named the field `password` — but ResetPasswordDto (and the service code
// that reads dto.token / dto.newPassword) needs both `token` and
// `newPassword`. Corrected below; `confirmPassword` stays client-only and
// is stripped before the request is sent (see ResetPasswordPayload).
import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email likhna zaroori hai").email("Sahi email likhein"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token missing hai — link dobara request karo"),
    newPassword: z
      .string()
      .min(8, "Password kam az kam 8 characters ka hona chahiye")
      .regex(/[A-Z]/, "Ek capital letter zaroori hai")
      .regex(/[0-9]/, "Ek number zaroori hai"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords match nahi kar rahe",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;