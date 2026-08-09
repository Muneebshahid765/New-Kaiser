// features/admin-settings/types/admin-settings-response.types.ts
import type { ThemeMode, CurrencyCode, LanguageCode, DateFormatType } from "./admin-settings.types";

// Endpoints below with no `data` field in the backend response keep their
// full { success, message } envelope, since api-client.ts's interceptor only
// unwraps `response.data.data` when a `data` key is present.
export interface MessageResponse {
  success: boolean;
  message: string;
}

// ─── GET /settings ────────────────────────────────────────────────────────────
export interface AdminSettingsResponse {
  id: string;
  twoFactorEnabled: boolean;
  profile: {
    name: string;
    email: string;
    profilePicture: string | null;
  };
  preferences: {
    currency: CurrencyCode;
    language: LanguageCode;
    timezoneAuto: boolean;
    timezoneManual: string;
    dateFormat: DateFormatType;
  };
  notifications: {
    emailAlerts: boolean;
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    customerAlerts: boolean;
    systemAlerts: boolean;
  };
  theme: {
    mode: ThemeMode;
    sidebarCollapsed: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeoutMin: number;
    lastPasswordChange: string | null;
  };
  siteWideDiscount: {
    enabled: boolean;
    percentage: number;
    bannerText: string;
    startDate: string | null;
    endDate: string | null;
  };
}

// ─── PUT /settings/theme (has `data`, gets unwrapped) ───────────────────────
export interface ThemeResponse {
  mode: ThemeMode;
  sidebarCollapsed: boolean;
}

// ─── POST /settings/profile-picture (has `data`, gets unwrapped) ───────────
export interface ProfilePictureResponse {
  profilePicture: string;
}

// ─── PUT /settings/site-wide-discount (has `data`, gets unwrapped) ─────────
export interface SiteWideDiscountResponse {
  enabled: boolean;
  percentage: number;
  bannerText: string;
  startDate: string | null;
  endDate: string | null;
}

// ─── PUT /settings/preferences (has `data`, gets unwrapped) ─────────────────
export interface PreferencesResponse {
  prefCurrency: CurrencyCode;
  prefLanguage: LanguageCode;
  prefTimezoneAuto: boolean;
  prefTimezoneManual: string;
  prefDateFormat: DateFormatType;
}

// ─── PUT /settings/notifications (has `data`, gets unwrapped) ──────────────
export interface NotificationsResponse {
  emailAlerts: boolean;
  orderAlerts: boolean;
  lowStockAlerts: boolean;
  customerAlerts: boolean;
  systemAlerts: boolean;
}

// ─── GET /settings/public-discount — public, no auth (has `data`) ─────────
export interface PublicDiscountResponse {
  enabled: boolean;
  percentage: number;
  bannerText: string;
  startDate: string | null;
  endDate: string | null;
}