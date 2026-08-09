// features/admin-settings/api/admin-settings.api.ts
//
// NOTE ON PATH PREFIX: every other controller in this app (auth, categories)
// is called from the frontend using a bare path like "/auth/me" or
// "/categories", relying on NEXT_PUBLIC_API_URL already carrying the "/api"
// segment. AdminSettingsController is declared as @Controller('api/settings')
// on the backend — an extra "api/" prefix that none of the other controllers
// have. Calls below use "/settings/..." to stay consistent with the rest of
// the app; if you get 404s, it's worth checking whether that controller's
// "api/" prefix is redundant with a global prefix already set in main.ts.

import { get, put, post } from "@/services/https";
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
} from "../types/admin-settings-response.types";

export const getAdminSettings = () => get<AdminSettingsResponse>("/settings");

export const updateAdminProfile = (payload: UpdateAdminProfilePayload) =>
  put<MessageResponse>("/settings/profile", payload);

export const changeAdminPassword = (payload: ChangeAdminPasswordPayload) =>
  put<MessageResponse>("/settings/change-password", payload);

export const uploadAdminProfilePicture = (file: File) => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  return post<ProfilePictureResponse>("/settings/profile-picture", formData);
};

export const updateAdminTheme = (payload: UpdateThemePayload) =>
  put<ThemeResponse>("/settings/theme", payload);

export const updateAdminSecurity = (payload: UpdateSecuritySettingsPayload) =>
  put<MessageResponse>("/settings/security", payload);

export const updateSiteWideDiscount = (payload: UpdateSiteWideDiscountPayload) =>
  put<SiteWideDiscountResponse>("/settings/site-wide-discount", payload);

export const updateAdminPreferences = (payload: UpdatePreferencesPayload) =>
  put<PreferencesResponse>("/settings/preferences", payload);

export const updateAdminNotifications = (payload: UpdateNotificationsPayload) =>
  put<NotificationsResponse>("/settings/notifications", payload);

// Public — no auth guard on the backend for this one
export const getPublicDiscount = () => get<PublicDiscountResponse>("/settings/public-discount");