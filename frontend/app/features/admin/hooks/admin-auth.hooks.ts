// features/admin-auth/hooks/admin-auth.hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import { useGetAuth } from "@/context/auth-context";
import { AUTH_QUERY_KEY } from "@/context/auth-context";
import { ApiError } from "@/services/https";
import {
  adminLogin,
  verifyAdminLoginTwoFactor,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
} from "../api/admin-auth.api";
import type {
  AdminLoginPayload,
  VerifyTwoFactorSetupPayload,
  VerifyTwoFactorLoginPayload,
  DisableTwoFactorPayload,
} from "../types/admin-auth.types";
import {
  requiresTwoFactor,
  type AdminLoginResponse,
  type AdminVerifyLoginResponse,
  type TwoFactorSetupResponse,
  type TwoFactorEnabledResponse,
  type TwoFactorDisabledResponse,
  type TwoFactorStatusResponse,
} from "../types/admin-auth-response.types";

export const TWO_FACTOR_STATUS_KEY = ["admin-auth", "2fa-status"] as const;

// ─── Login step 1: email + password ──────────────────────────────────────────
// Deliberately NOT using useMutationWithToast here: a `requiresTwoFactor`
// response is a normal, expected outcome (not a failure), and firing a
// generic "success" toast at that point would be misleading — the user
// still has to clear the OTP step. The component reads `requiresTwoFactor()`
// on the result to decide whether to show the OTP screen or finish up.
export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AdminLoginResponse, ApiError, AdminLoginPayload>({
    mutationFn: adminLogin,
    onSuccess: async (data) => {
      if (requiresTwoFactor(data)) {
        return; // let the component move to the OTP-entry screen
      }
      toast.success("Login successful.");
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// ─── Login step 2: OTP from the authenticator app ────────────────────────────
export function useVerifyAdminLoginTwoFactor() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AdminVerifyLoginResponse, ApiError, VerifyTwoFactorLoginPayload>({
    mutationFn: verifyAdminLoginTwoFactor,
    onSuccess: async () => {
      toast.success("Login successful.");
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// ─── 2FA status (gated behind an authenticated admin session) ──────────────
export function useTwoFactorStatus() {
  const { data: user, isLoading: isAuthLoading } = useGetAuth();

  return useQuery<TwoFactorStatusResponse, Error>({
    queryKey: TWO_FACTOR_STATUS_KEY,
    queryFn: getTwoFactorStatus,
    enabled: !!user && !isAuthLoading && user.role === "admin",
    staleTime: 1_000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Begin setup — returns the QR code to scan ──────────────────────────────
export function useSetupTwoFactor() {
  return useMutationWithToast<TwoFactorSetupResponse, void>(setupTwoFactor, {
    successMsg: "Scan the QR code with your authenticator app.",
  });
}

// ─── Confirm setup with the first OTP ────────────────────────────────────────
export function useVerifyAndEnableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutationWithToast<TwoFactorEnabledResponse, VerifyTwoFactorSetupPayload>(
    verifyAndEnableTwoFactor,
    {
      successMsg: "Two-factor authentication enabled.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TWO_FACTOR_STATUS_KEY });
      },
    },
  );
}

// ─── Disable 2FA ──────────────────────────────────────────────────────────────
export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutationWithToast<TwoFactorDisabledResponse, DisableTwoFactorPayload>(
    disableTwoFactor,
    {
      successMsg: "Two-factor authentication disabled.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TWO_FACTOR_STATUS_KEY });
      },
    },
  );
}