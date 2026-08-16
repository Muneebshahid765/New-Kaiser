// features/admin-settings/hooks/admin-settings.hooks.ts
//
// All admin-only queries are gated behind useGetAuth() so they only fire
// after the identity check succeeds — same pattern as profile-management.hooks.ts.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
// import { useGetAuth } from "@/context/auth-context";
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
} from "../api/admin-settings.api";
import type {
  UpdateAdminProfilePayload,
  ChangeAdminPasswordPayload,
  UpdateThemePayload,
  UpdateSecuritySettingsPayload,
  UpdateSiteWideDiscountPayload,
  UpdatePreferencesPayload,
  UpdateNotificationsPayload,
} from "../types/admin-settings.types";
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
} from "../types/admin-settings-response.types";

// ─── Canonical Query Keys ─────────────────────────────────────────────────────
export const ADMIN_SETTINGS_KEY = ["admin-settings"] as const;
export const PUBLIC_DISCOUNT_KEY = ["public-discount"] as const;

export const SYSTEM_HEALTH_KEY = ["system-activity-health"] as const;

export function useSystemActivityAndHealth() {
  // const { data: user, isLoading: isAuthLoading } = useGetAuth();

  return useQuery<SystemActivityAndHealthResponse, Error>({
    queryKey: SYSTEM_HEALTH_KEY,
    queryFn: getSystemActivityAndHealth,
    enabled: true,
    staleTime: 1_000 * 30, // Refetch every 30 seconds
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Get All Settings ─────────────────────────────────────────────────────────
export function useAdminSettings() {
  // const { data: user, isLoading: isAuthLoading } = useGetAuth();

  return useQuery<AdminSettingsResponse, Error>({
    queryKey: ADMIN_SETTINGS_KEY,
    queryFn: getAdminSettings,
    enabled: true,
    staleTime: 1_000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Update Profile (Name / Email) ──────────────────────────────────────────
export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();

  return useMutationWithToast<MessageResponse, UpdateAdminProfilePayload>(updateAdminProfile, {
    successMsg: "Profile updated successfully.",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
    },
  });
}

// ─── Change Password ──────────────────────────────────────────────────────────
export function useChangeAdminPassword() {
  return useMutationWithToast<MessageResponse, ChangeAdminPasswordPayload>(
    changeAdminPassword,
    { successMsg: "Password changed successfully." },
  );
}

// ─── Upload Profile Picture ───────────────────────────────────────────────────
export function useUploadAdminProfilePicture() {
  const queryClient = useQueryClient();

  return useMutationWithToast<ProfilePictureResponse, File>(uploadAdminProfilePicture, {
    successMsg: "Profile picture uploaded successfully.",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
    },
  });
}

// ─── Update Theme ─────────────────────────────────────────────────────────────
export function useUpdateAdminTheme() {
  const queryClient = useQueryClient();

  return useMutationWithToast<ThemeResponse, UpdateThemePayload>(updateAdminTheme, {
    successMsg: "Theme settings updated successfully.",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
    },
  });
}

// ─── Update Security ──────────────────────────────────────────────────────────
export function useUpdateAdminSecurity() {
  const queryClient = useQueryClient();

  return useMutationWithToast<MessageResponse, UpdateSecuritySettingsPayload>(
    updateAdminSecurity,
    {
      successMsg: "Security settings updated successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
      },
    },
  );
}

// ─── Update Site-Wide Discount ────────────────────────────────────────────────
export function useUpdateSiteWideDiscount() {
  const queryClient = useQueryClient();

  return useMutationWithToast<SiteWideDiscountResponse, UpdateSiteWideDiscountPayload>(
    updateSiteWideDiscount,
    {
      successMsg: "Site-wide discount updated successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
        queryClient.invalidateQueries({ queryKey: PUBLIC_DISCOUNT_KEY });
      },
    },
  );
}

// ─── Update Preferences ───────────────────────────────────────────────────────
export function useUpdateAdminPreferences() {
  const queryClient = useQueryClient();

  return useMutationWithToast<PreferencesResponse, UpdatePreferencesPayload>(
    updateAdminPreferences,
    {
      successMsg: "Preferences updated successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
      },
    },
  );
}

// ─── Update Notifications ─────────────────────────────────────────────────────
export function useUpdateAdminNotifications() {
  const queryClient = useQueryClient();

  return useMutationWithToast<NotificationsResponse, UpdateNotificationsPayload>(
    updateAdminNotifications,
    {
      successMsg: "Notification preferences updated successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
      },
    },
  );
}

// ─── Public Discount Banner (no auth required) ────────────────────────────────
export function usePublicDiscount() {
  return useQuery<PublicDiscountResponse, Error>({
    queryKey: PUBLIC_DISCOUNT_KEY,
    queryFn: getPublicDiscount,
    staleTime: 1_000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}