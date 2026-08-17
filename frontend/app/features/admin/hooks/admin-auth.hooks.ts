// features/admin-auth/hooks/admin-auth.hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutationWithToast } from '@/hooks/use-mutation-toast';
import { useGetAuth } from '@/context/auth-context';
import { AUTH_QUERY_KEY } from '@/context/auth-context';
import { ApiError } from '@/services/https';
import {
  adminLogin,
  verifyAdminLoginTwoFactor,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
} from '../api/admin-auth.api';
import type {
  AdminLoginPayload,
  VerifyTwoFactorSetupPayload,
  VerifyTwoFactorLoginPayload,
  DisableTwoFactorPayload,
} from '../types/admin-auth.types';
import {
  requiresTwoFactor,
  type AdminLoginResponse,
  type AdminVerifyLoginResponse,
  type TwoFactorSetupResponse,
  type TwoFactorEnabledResponse,
  type TwoFactorDisabledResponse,
  type TwoFactorStatusResponse,
} from '../types/admin-auth-response.types';
import { ADMIN_SETTINGS_KEY } from './admin-settings.hooks';

export const TWO_FACTOR_STATUS_KEY = ['admin-auth', '2fa-status'] as const;

// ─── Login step 1: email + password ──────────────────────────────────────────
export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AdminLoginResponse, ApiError, AdminLoginPayload>({
    mutationFn: adminLogin,
    onSuccess: async (data) => {
      if (requiresTwoFactor(data)) {
        // Component reads data.data.tempSessionId + data.data.email to show OTP screen
        return;
      }
      toast.success('Login successful.');
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.replace('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Login failed.');
    },
  });
}

// ─── Login step 2: OTP ────────────────────────────────────────────────────────
export function useVerifyAdminLoginTwoFactor() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AdminVerifyLoginResponse, ApiError, VerifyTwoFactorLoginPayload>({
    mutationFn: verifyAdminLoginTwoFactor,
    onSuccess: async () => {
      toast.success('Login successful.');
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.replace('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Invalid verification code.');
    },
  });
}

// ─── 2FA status ──────────────────────────────────────────────────────────────
export function useTwoFactorStatus() {
  const { data: user, isLoading: isAuthLoading } = useGetAuth();

  return useQuery<TwoFactorStatusResponse, Error>({
    queryKey: TWO_FACTOR_STATUS_KEY,
    queryFn: getTwoFactorStatus,
    enabled: !!user && !isAuthLoading && user.role === 'admin',
    staleTime: 1_000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Begin setup — returns QR code ───────────────────────────────────────────
export function useSetupTwoFactor() {
  return useMutationWithToast<TwoFactorSetupResponse, void>(setupTwoFactor, {
    successMsg: 'Scan the QR code with your authenticator app.',
  });
}

// ─── Confirm setup with first OTP ────────────────────────────────────────────
export function useVerifyAndEnableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutationWithToast<TwoFactorEnabledResponse, VerifyTwoFactorSetupPayload>(
    verifyAndEnableTwoFactor,
    {
      successMsg: 'Two-factor authentication enabled.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TWO_FACTOR_STATUS_KEY });
        // Refresh settings so the security section reflects the new state
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
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
      successMsg: 'Two-factor authentication disabled.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: TWO_FACTOR_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
      },
    },
  );
}