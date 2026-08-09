// features/auth/schemas/verify-email.schema.ts
//
// FIX: the previous auth.api.ts called verifyEmail(token: string) and sent
// { token }. BuyerAuthService.verifyEmail() reads dto.email + dto.code —
// there's no "token" field at all in that flow (that's what reset-password
// uses instead). Corrected below.
import { z } from "zod";

export const verifyEmailSchema = z.object({
  email: z.string().min(1, "Email daalna zaroori hai").email("Valid email daalo"),
  code: z.string().regex(/^\d{6}$/, "6-digit code daalo"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().min(1, "Email daalna zaroori hai").email("Valid email daalo"),
});

export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;