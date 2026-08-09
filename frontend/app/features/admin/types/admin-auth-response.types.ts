// features/admin-auth/types/admin-auth-response.types.ts

// ─── Shared ────────────────────────────────────────────────────────────────
export interface AdminAuthUser {
  id: string; // adminProfile.id
  userId: string; // user.id
  name: string;
  email: string;
  role: "admin";
  lastLogin: string | null;
  twoFactorEnabled: boolean;
}

// ─── POST /admin/auth/login ──────────────────────────────────────────────────
// This endpoint is called with `skipUnwrap: true` — its top-level keys
// (`requiresTwoFactor` / `token`) matter as much as `data`, so the global
// data.data auto-unwrap must NOT run here or that flag gets lost.
export interface AdminLoginTwoFactorRequiredResponse {
  requiresTwoFactor: true;
  message: string;
  data: {
    email: string;
    tempSessionId: string;
  };
}

export interface AdminLoginSuccessResponse {
  message: string;
  token: string; // see note in admin-auth.api.ts re: this only matters if the
  // backend cookie-sets admin_token — otherwise this is the actual session token
  data: AdminAuthUser;
}

export type AdminLoginResponse =
  | AdminLoginTwoFactorRequiredResponse
  | AdminLoginSuccessResponse;

export function requiresTwoFactor(
  res: AdminLoginResponse,
): res is AdminLoginTwoFactorRequiredResponse {
  return (res as AdminLoginTwoFactorRequiredResponse).requiresTwoFactor === true;
}

// ─── POST /admin/auth/verify-login ──────────────────────────────────────────
// Same envelope shape as the non-2FA branch of login — also skipUnwrap: true.
export type AdminVerifyLoginResponse = AdminLoginSuccessResponse;

// ─── POST /admin/auth/setup ──────────────────────────────────────────────────
// No skipUnwrap needed — only `message` + `data`, normal unwrap is fine.
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string; // data: URL, render directly in an <img src="...">
  manualEntryKey: string;
}

// ─── POST /admin/auth/verify ─────────────────────────────────────────────────
export interface TwoFactorEnabledResponse {
  twoFactorEnabled: true;
}

// ─── POST /admin/auth/disable ────────────────────────────────────────────────
export interface TwoFactorDisabledResponse {
  twoFactorEnabled: false;
}

// ─── GET /admin/auth/status ───────────────────────────────────────────────────
export interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
}