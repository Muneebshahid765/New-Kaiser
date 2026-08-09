// features/admin-auth/schemas/admin-auth.schema.ts
import { z } from "zod";

// ─── Login ────────────────────────────────────────────────────────────────────
export const AdminLoginSchema = z.object({
  email: z.string().min(1, "Email daalna zaroori hai").email("Valid email daalo"),
  password: z.string().min(1, "Password daalna zaroori hai"),
});

// ─── 2FA Setup Verify (enable 2FA after scanning QR) ─────────────────────────
export const VerifyTwoFactorSetupSchema = z.object({
  token: z
    .string()
    .regex(/^\d{6}$/, "6-digit code daalo"),
});

// ─── 2FA Login Verify (OTP step after password is correct) ──────────────────
export const VerifyTwoFactorLoginSchema = z.object({
  email: z.string().email("Valid email daalo"),
  tempSessionId: z.string().min(1, "Session id missing — dobara login karo"),
  token: z.string().regex(/^\d{6}$/, "6-digit code daalo"),
});

// ─── Disable 2FA (requires password + a current OTP) ─────────────────────────
export const DisableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password daalna zaroori hai"),
  token: z.string().regex(/^\d{6}$/, "6-digit code daalo"),
});