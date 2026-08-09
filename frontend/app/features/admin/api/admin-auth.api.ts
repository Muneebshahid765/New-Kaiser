// features/admin-auth/api/admin-auth.api.ts
//
// ⚠️ AdminAuthController.login() in the code you shared does not take a
// @Res({ passthrough: true }) response and never calls res.cookie('admin_token', ...)
// — unlike BuyerAuthController.login(), which does. Right now the admin
// token only ever reaches the client inside the JSON body (`token` field
// below), it is never actually set as an httpOnly cookie. For this app's
// cookie-only auth model (see https.ts) to work for admins, that controller
// needs the same res.cookie(...) treatment as the buyer one. Same gap
// applies to verifyLogin(). Until that's fixed, admin sessions won't
// persist across requests no matter what the frontend does.
//
// There's also no admin logout route shown yet — https.ts's forceClientLogout
// currently points at "/buyer/auth/logout"; once an admin logout endpoint
// exists, branch that path by role (or give each app its own https.ts config).

import { get, post } from "@/services/https";
import type {
  AdminLoginPayload,
  VerifyTwoFactorSetupPayload,
  VerifyTwoFactorLoginPayload,
  DisableTwoFactorPayload,
} from "../types/admin-auth.types";
import type {
  AdminLoginResponse,
  AdminVerifyLoginResponse,
  TwoFactorSetupResponse,
  TwoFactorEnabledResponse,
  TwoFactorDisabledResponse,
  TwoFactorStatusResponse,
} from "../types/admin-auth-response.types";

// ─── Login (may return a 2FA challenge instead of a session) ────────────────
export const adminLogin = (payload: AdminLoginPayload) =>
  post<AdminLoginResponse>("/admin/auth/login", payload, { skipUnwrap: true });

// ─── Complete login by submitting the OTP from the authenticator app ───────
export const verifyAdminLoginTwoFactor = (payload: VerifyTwoFactorLoginPayload) =>
  post<AdminVerifyLoginResponse>("/admin/auth/verify-login", payload, {
    skipUnwrap: true,
  });

// ─── Begin 2FA setup — returns a QR code to scan ────────────────────────────
export const setupTwoFactor = () => post<TwoFactorSetupResponse>("/admin/auth/setup");

// ─── Confirm the scanned QR by submitting the first OTP ─────────────────────
export const verifyAndEnableTwoFactor = (payload: VerifyTwoFactorSetupPayload) =>
  post<TwoFactorEnabledResponse>("/admin/auth/verify", payload);

// ─── Disable 2FA (requires current password + a valid OTP) ──────────────────
export const disableTwoFactor = (payload: DisableTwoFactorPayload) =>
  post<TwoFactorDisabledResponse>("/admin/auth/disable", payload);

// ─── Current 2FA status ───────────────────────────────────────────────────────
export const getTwoFactorStatus = () => get<TwoFactorStatusResponse>("/admin/auth/status");