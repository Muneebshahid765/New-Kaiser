/*eslint-disable*/
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES — yeh pieces har schema mein reuse hote hain,
// isi liye Zod jaisi library ka fayda hota hai: ek jagah define karo,
// jahan bhi email/OTP/password chahiye wahan .extend() ya seedha
// object mein daal do
// ─────────────────────────────────────────────────────────────

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address');

const otpField = z
  .string()
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d+$/, 'Verification code must contain only numbers');

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─────────────────────────────────────────────────────────────
// 1. EMAIL VERIFICATION (registration ke baad OTP confirm karna)
// ─────────────────────────────────────────────────────────────

export const verifyEmailSchema = z.object({
  email: emailField,
  code: otpField,
});
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

// ─────────────────────────────────────────────────────────────
// 2. RESEND VERIFICATION CODE (agar OTP expire ho jaye ya na mile)
// ─────────────────────────────────────────────────────────────

export const resendVerificationSchema = z.object({
  email: emailField,
});
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;

// ─────────────────────────────────────────────────────────────
// 3. FORGOT PASSWORD — Step 1: reset request (sirf email chahiye)
// 👇 Yahan wahi `emailField` reuse ho raha hai jo upar verify-email
// mein use hua — is se agar kal email validation rule change karna
// ho (jaise domain restriction), sirf ek jagah change karna hoga
// ─────────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

// ─────────────────────────────────────────────────────────────
// 4. RESET PASSWORD — Step 2: OTP + naya password
// 👇 Yahan emailField, otpField, AUR passwordField teeno reuse ho
// rahe hain — yehi Zod ka asal fayda hai
// ─────────────────────────────────────────────────────────────

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;