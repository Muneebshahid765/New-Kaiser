// features/admin-settings/types/admin-settings.types.ts
import { z } from "zod";
import {
  UpdateAdminProfileSchema,
  ChangeAdminPasswordSchema,
  UpdateThemeSchema,
  UpdateSecuritySettingsSchema,
  UpdateSiteWideDiscountSchema,
  UpdatePreferencesSchema,
  UpdateNotificationsSchema,
} from "../schemas/admin-settings.schemas";

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