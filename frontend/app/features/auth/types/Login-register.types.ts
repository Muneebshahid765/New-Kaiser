// features/auth/types/Login-register.types.ts
import { z } from "zod";
import { registerSchema } from "../schemas/register.schema";
import { loginSchema } from "../schemas/login.schemas";
import { verifyEmailSchema, resendVerificationSchema } from "../schemas/verify-email.schema";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas/password-reset.schema";

export type RegisterPayload = Omit<z.infer<typeof registerSchema>, "confirmPassword">;
export type LoginPayload = z.infer<typeof loginSchema>;
export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationPayload = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;

// FIX: ResetPasswordDto (backend) is read as dto.token / dto.newPassword —
// the previous payload shape here was { token, password, confirmPassword },
// missing `token` entirely from the type and using the wrong field name.
// `confirmPassword` is form-only and gets stripped before the request goes out.
export type ResetPasswordPayload = Omit<
  z.infer<typeof resetPasswordSchema>,
  "confirmPassword"
>;

// NOTE: ChangePasswordPayload used to live here, but the endpoint it belongs
// to is Buyer**Profile**Controller (PUT /buyer/profile/change-password), not
// buyer auth — moved to the buyer-profile feature, and its field names fixed
// to currentPassword/newPassword (the old oldPassword/newPassword pair didn't
// match ChangePasswordDto's usage of dto.currentPassword).