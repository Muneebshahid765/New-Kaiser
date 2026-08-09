// features/auth/api/auth.api.ts
//
// FIXES vs. the previous version of this file:
//  1. Every path now goes under /buyer/auth/... — BuyerAuthController is
//     @Controller('buyer/auth'), not a bare 'auth' prefix. The old bare
//     "/auth/login" etc. paths would 404 against the real backend.
//  2. verifyEmail now sends { email, code } instead of { token } — that's
//     what BuyerAuthService.verifyEmail() actually reads.
//  3. verifyResetToken is now a GET with a query param (matching
//     @Get('verify-reset-token') @Query('token')), not a POST with a body.
//  4. logout takes no body (unchanged) but now hits the right path.

import { get, post } from "@/services/https";
import type {
  RegisterPayload,
  LoginPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types/Login-register.types";
import type {
  RegisterResponse,
  LoginResponse,
  VerifyEmailResponse,
  VerifyResetTokenResponse,
  MessageResponse,
} from "../types/auth-response.types";

export const registerUser = (payload: RegisterPayload) =>
  post<RegisterResponse>("/buyer/auth/register", payload);

export const verifyEmail = (payload: VerifyEmailPayload) =>
  post<VerifyEmailResponse>("/buyer/auth/verify-email", payload);

export const resendVerificationCode = (payload: ResendVerificationPayload) =>
  post<MessageResponse>("/buyer/auth/resend-verification-code", payload);

export const login = (payload: LoginPayload) =>
  post<LoginResponse>("/buyer/auth/login", payload);

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  post<MessageResponse>("/buyer/auth/forgot-password", payload);

export const resetPassword = (payload: ResetPasswordPayload) =>
  post<MessageResponse>("/buyer/auth/reset-password", payload);

export const verifyResetToken = (token: string) =>
  get<VerifyResetTokenResponse>("/buyer/auth/verify-reset-token", { params: { token } });

export const logout = () => post<MessageResponse>("/buyer/auth/logout");