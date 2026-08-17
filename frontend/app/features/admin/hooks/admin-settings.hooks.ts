// features/admin-settings/hooks/admin-settings.hooks.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutationWithToast } from '@/hooks/use-mutation-toast';
import {
  getAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminProfilePicture,
  updateAdminTheme,
  updateAdminSecurity,
  updateSiteWideDiscount,
  updateAdminPreferences,
  updateAdminNotifications,
  getPublicDiscount,
  getSystemActivityAndHealth,
} from '../api/admin-settings.api';
import type {
  UpdateAdminProfilePayload,
  ChangeAdminPasswordPayload,
  UpdateThemePayload,
  UpdateSecuritySettingsPayload,
  UpdateSiteWideDiscountPayload,
  UpdatePreferencesPayload,
  UpdateNotificationsPayload,
} from '../schemas/admin-settings.schemas';
import type {
  AdminSettingsResponse,
  MessageResponse,
  ThemeResponse,
  ProfilePictureResponse,
  SiteWideDiscountResponse,
  PreferencesResponse,
  NotificationsResponse,
  PublicDiscountResponse,
  SystemActivityAndHealthResponse,
} from '../types/admin-settings-response.types';

export const ADMIN_SETTINGS_KEY = ['admin-settings'] as const;
export const PUBLIC_DISCOUNT_KEY = ['public-discount'] as const;
export const SYSTEM_HEALTH_KEY = ['system-activity-health'] as const;

// ─── GET /settings ────────────────────────────────────────────────────────
export function useAdminSettings() {
  return useQuery<AdminSettingsResponse, Error>({
    queryKey: ADMIN_SETTINGS_KEY,
    queryFn: getAdminSettings,
    staleTime: 1_000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── GET /settings/activity-and-health ────────────────────────────────────
export function useSystemActivityAndHealth() {
  return useQuery<SystemActivityAndHealthResponse, Error>({
    queryKey: SYSTEM_HEALTH_KEY,
    queryFn: getSystemActivityAndHealth,
    staleTime: 1_000 * 30,
    refetchInterval: 1_000 * 30, // auto-refresh every 30s
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── PUT /settings/profile ────────────────────────────────────────────────
export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutationWithToast<MessageResponse, UpdateAdminProfilePayload>(
    updateAdminProfile,
    {
      successMsg: 'Profile updated successfully.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY }),
    },
  );
}

// ─── PUT /settings/change-password ────────────────────────────────────────
export function useChangeAdminPassword() {
  return useMutationWithToast<MessageResponse, ChangeAdminPasswordPayload>(
    changeAdminPassword,
    { successMsg: 'Password changed successfully.' },
  );
}

// ─── POST /settings/profile-picture ──────────────────────────────────────
export function useUploadAdminProfilePicture() {
  const queryClient = useQueryClient();
  return useMutationWithToast<ProfilePictureResponse, File>(
    uploadAdminProfilePicture,
    {
      successMsg: 'Profile picture updated.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY }),
    },
  );
}

// ─── PUT /settings/theme ─────────────────────────────────────────────────
export function useUpdateAdminTheme() {
  const queryClient = useQueryClient();
  return useMutationWithToast<ThemeResponse, UpdateThemePayload>(
    updateAdminTheme,
    {
      successMsg: 'Theme updated.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY }),
    },
  );
}

// ─── PUT /settings/security ──────────────────────────────────────────────
export function useUpdateAdminSecurity() {
  const queryClient = useQueryClient();
  return useMutationWithToast<MessageResponse, UpdateSecuritySettingsPayload>(
    updateAdminSecurity,
    {
      successMsg: 'Security settings updated.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY }),
    },
  );
}

// ─── PUT /settings/site-wide-discount ────────────────────────────────────
export function useUpdateSiteWideDiscount() {
  const queryClient = useQueryClient();
  return useMutationWithToast<SiteWideDiscountResponse, UpdateSiteWideDiscountPayload>(
    updateSiteWideDiscount,
    {
      successMsg: 'Discount settings updated.',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
        queryClient.invalidateQueries({ queryKey: PUBLIC_DISCOUNT_KEY });
      },
    },
  );
}

// ─── PUT /settings/preferences ───────────────────────────────────────────
export function useUpdateAdminPreferences() {
  const queryClient = useQueryClient();
  return useMutationWithToast<PreferencesResponse, UpdatePreferencesPayload>(
    updateAdminPreferences,
    {
      successMsg: 'Preferences saved.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY }),
    },
  );
}

// ─── PUT /settings/notifications ─────────────────────────────────────────
export function useUpdateAdminNotifications() {
  const queryClient = useQueryClient();
  return useMutationWithToast<NotificationsResponse, UpdateNotificationsPayload>(
    updateAdminNotifications,
    {
      successMsg: 'Notification preferences saved.',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY }),
    },
  );
}

// ─── GET /settings/public-discount (no auth) ─────────────────────────────
export function usePublicDiscount() {
  return useQuery<PublicDiscountResponse, Error>({
    queryKey: PUBLIC_DISCOUNT_KEY,
    queryFn: getPublicDiscount,
    staleTime: 1_000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}