/*eslint-disable*/
import { z } from 'zod';

// =========================
// Setup Confirmation DTO
// =========================

export const VerifyTwoFactorSetupSchema = z.object({
  token: z
    .string({ error: 'Verification code is required' })
    .length(6, 'Verification code must be 6 digits'),
});

export type VerifyTwoFactorSetupDto = z.infer<
  typeof VerifyTwoFactorSetupSchema
>;

// =========================
// Login 2FA Verification DTO
// =========================

export const VerifyTwoFactorLoginSchema = z.object({
  token: z
    .string({ error: 'Verification code is required' })
    .length(6, 'Verification code must be 6 digits'),

  tempSessionId: z
    .string({ error: 'Session ID is required' })
    .uuid('Invalid Session ID format'),

  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email address'),
});

export type VerifyTwoFactorLoginDto = z.infer<
  typeof VerifyTwoFactorLoginSchema
>;

// =========================
// Disable 2FA DTO
// =========================

export const DisableTwoFactorSchema = z.object({
  token: z
    .string({ error: 'Verification code is required' })
    .length(6, 'Verification code must be 6 digits'),

  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

export type DisableTwoFactorDto = z.infer<
  typeof DisableTwoFactorSchema
>;