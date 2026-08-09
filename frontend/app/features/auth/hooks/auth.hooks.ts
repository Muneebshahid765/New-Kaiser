/* eslint-disable */
/**
 * @file auth.hooks.ts
 *
 * ─── NO DUPLICATE useGetAuth ──────────────────────────────────────────────────
 * useGetAuth is defined once in auth-context.tsx and re-exported here.
 */

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import { ApiError } from "@/services/https";

export { useGetAuth } from "@/context/auth-context";
import { AUTH_QUERY_KEY } from "@/context/auth-context";

import {
  RegisterPayload,
  LoginPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types/Login-register.types";
import {
  RegisterResponse,
  LoginResponse,
  VerifyEmailResponse,
  VerifyResetTokenResponse,
  MessageResponse,
} from "../types/auth-response.types";
import {
  forgotPassword,
  login,
  logout,
  registerUser,
  resendVerificationCode,
  resetPassword,
  verifyResetToken,
  verifyEmail,
} from "../api/auth.api";

// ── Register ──────────────────────────────────────────────────────────────────
export function useRegister() {
  return useMutationWithToast<RegisterResponse, RegisterPayload>(registerUser, {
    successMsg: "Account created. Please verify your email.",
  });
}

// ── Verify Email ───────────────────────────────────────────────────────────────
export function useVerifyEmail() {
  return useMutationWithToast<VerifyEmailResponse, VerifyEmailPayload>(verifyEmail, {
    successMsg: "Email verified successfully.",
  });
}

// ── Resend Verification Code ──────────────────────────────────────────────────
export function useResendVerificationCode() {
  return useMutationWithToast<MessageResponse, ResendVerificationPayload>(
    resendVerificationCode,
    { successMsg: "Verification code sent." },
  );
}

// ── Login ──────────────────────────────────────────────────────────────────────
// NOTE: redirects to "/account" — adjust to wherever the buyer landing page
// actually is in your app. If this Next.js app is admin-only and buyer pages
// live in a separate frontend, this hook (and the buyer-profile module)
// belongs over there instead.
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutationWithToast<LoginResponse, LoginPayload>(login, {
    successMsg: "Login successful.",
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.replace("/account");
    },
  });
}

// ── Forgot Password ───────────────────────────────────────────────────────────
export function useForgotPassword() {
  return useMutationWithToast<MessageResponse, ForgotPasswordPayload>(forgotPassword, {
    successMsg: "If that email is registered, a reset link has been sent.",
  });
}

// ── Reset Password ────────────────────────────────────────────────────────────
export function useResetPassword() {
  return useMutationWithToast<MessageResponse, ResetPasswordPayload>(resetPassword, {
    successMsg: "Password reset successfully.",
  });
}

// ── Verify Reset Token ────────────────────────────────────────────────────────
// FIX: this used to be a mutation, but /buyer/auth/verify-reset-token is a
// read-only GET — model it as a query so it fires automatically when the
// reset-password page loads with ?token=... in the URL, rather than needing
// something to trigger it.
export function useVerifyResetToken(token: string | undefined) {
  return useQuery<VerifyResetTokenResponse, ApiError>({
    queryKey: ["auth", "verify-reset-token", token],
    queryFn: () => verifyResetToken(token as string),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutationWithToast<MessageResponse, void>(logout, {
    successMsg: "Logged out successfully.",
    onSuccess: () => {
      // Remove cached user immediately so AuthProvider does not flash stale data
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      router.replace("/login");
    },
  });
}