// features/admin-auth/types/admin-auth-response.types.ts

// ─── Login step 1 — may return a 2FA challenge ────────────────────────────
export interface AdminLoginSuccessResponse {
  requiresTwoFactor?: false;
  message: string;
  token: string;
  data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    lastLogin: string | null;
    twoFactorEnabled: boolean;
  };
}

export interface AdminLoginTwoFactorChallengeResponse {
  requiresTwoFactor: true;
  message: string;
  data: {
    email: string;
    tempSessionId: string;
  };
}

export type AdminLoginResponse =
  | AdminLoginSuccessResponse
  | AdminLoginTwoFactorChallengeResponse;

// Type guard
export function requiresTwoFactor(
  res: AdminLoginResponse,
): res is AdminLoginTwoFactorChallengeResponse {
  return res.requiresTwoFactor === true;
}

// ─── Login step 2 — OTP verify ────────────────────────────────────────────
export interface AdminVerifyLoginResponse {
  message: string;
  token: string;
  data: {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    lastLogin: string | null;
    twoFactorEnabled: boolean;
  };
}

// ─── 2FA Setup — returns QR + secret ─────────────────────────────────────
export interface TwoFactorSetupResponse {
  message: string;
  data: {
    secret: string;
    qrCode: string;       // base64 data URL for <img src={qrCode} />
    manualEntryKey: string;
  };
}

// ─── 2FA Enable confirm ───────────────────────────────────────────────────
export interface TwoFactorEnabledResponse {
  message: string;
  data: { twoFactorEnabled: true };
}

// ─── 2FA Disable ──────────────────────────────────────────────────────────
export interface TwoFactorDisabledResponse {
  message: string;
  data: { twoFactorEnabled: false };
}

// ─── 2FA Status ───────────────────────────────────────────────────────────
export interface TwoFactorStatusResponse {
  data: { twoFactorEnabled: boolean };
}