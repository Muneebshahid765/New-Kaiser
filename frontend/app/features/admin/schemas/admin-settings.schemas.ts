// features/admin-settings/schemas/admin-settings.schema.ts
import { z } from "zod";

// ─── Shared Enums ──────────────────────────────────────────────────────────
export const ThemeModeEnum = z.enum(["light", "dark", "auto"]);
export const CurrencyCodeEnum = z.enum(["USD", "GBP", "EUR", "PKR", "INR"]);
export const LanguageCodeEnum = z.enum(["en", "pt", "ur", "es", "fr"]);
export const DateFormatEnum = z.enum(["MDY", "DMY", "YMD"]);

// ─── Update Profile (Name / Email) ──────────────────────────────────────────
export const UpdateAdminProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Naam kam az kam 2 characters ka ho")
    .max(50, "Naam 50 characters se ziada nahi ho sakta")
    .optional(),
  email: z.string().email("Valid email daalo").optional(),
});

// ─── Change Password ─────────────────────────────────────────────────────────
export const ChangeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password daalna zaroori hai"),
    newPassword: z.string().min(8, "Naya password kam az kam 8 characters ka ho"),
    confirmPassword: z.string().min(1, "Password confirm karna zaroori hai"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords match nahi kar rahe",
    path: ["confirmPassword"],
  });

// ─── Theme ────────────────────────────────────────────────────────────────────
export const UpdateThemeSchema = z.object({
  mode: ThemeModeEnum.optional(),
  sidebarCollapsed: z.boolean().optional(),
});

// ─── Security (session timeout) ─────────────────────────────────────────────
export const UpdateSecuritySettingsSchema = z.object({
  sessionTimeoutMin: z.coerce
    .number()
    .int()
    .min(1, "Kam az kam 1 minute")
    .max(1440, "24 ghante (1440 min) se ziada nahi")
    .optional(),
});

// ─── Site-Wide Discount ──────────────────────────────────────────────────────
export const UpdateSiteWideDiscountSchema = z.object({
  enabled: z.boolean().optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  bannerText: z.string().max(120, "Banner text 120 characters se ziada nahi").optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

// ─── Preferences ──────────────────────────────────────────────────────────────
export const UpdatePreferencesSchema = z.object({
  prefCurrency: CurrencyCodeEnum.optional(),
  prefLanguage: LanguageCodeEnum.optional(),
  prefTimezoneAuto: z.boolean().optional(),
  prefTimezoneManual: z.string().max(10).optional(),
  prefDateFormat: DateFormatEnum.optional(),
});

// ─── Notifications ────────────────────────────────────────────────────────────
export const UpdateNotificationsSchema = z.object({
  emailAlerts: z.boolean().optional(),
  orderAlerts: z.boolean().optional(),
  lowStockAlerts: z.boolean().optional(),
  customerAlerts: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
});


export type ThemeMode = "light" | "dark" | "auto";
export type CurrencyCode = "USD" | "GBP" | "EUR" | "PKR" | "INR";
export type LanguageCode = "en" | "pt" | "ur" | "es" | "fr";
export type DateFormatType = "MDY" | "DMY" | "YMD";

export type UpdateAdminProfilePayload = z.infer<typeof UpdateAdminProfileSchema>;
export type ChangeAdminPasswordPayload = z.infer<typeof ChangeAdminPasswordSchema>;
export type UpdateThemePayload = z.infer<typeof UpdateThemeSchema>;
export type UpdateSecuritySettingsPayload = z.infer<typeof UpdateSecuritySettingsSchema>;
export type UpdateSiteWideDiscountPayload = z.infer<typeof UpdateSiteWideDiscountSchema>;
export type UpdatePreferencesPayload = z.infer<typeof UpdatePreferencesSchema>;
export type UpdateNotificationsPayload = z.infer<typeof UpdateNotificationsSchema>;