// features/auth/types/auth-response.types.ts

// ======================================
// Common
// ======================================
export interface MessageResponse {
  message: string;
}

// ======================================
// Register — POST /buyer/auth/register
// (no `data` key in the response body, so the global unwrap interceptor
// leaves this shape untouched)
// ======================================
export interface RegisterResponse {
  message: string;
  buyer: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ======================================
// Verify Email — POST /buyer/auth/verify-email
// ======================================
export interface VerifyEmailResponse {
  message: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ======================================
// Login — POST /buyer/auth/login
// FIX: previously missing `message` (the controller always returns one
// alongside `buyer` and `token`, no `data` wrapper here either).
// ======================================
export interface LoginResponse {
  message: string;
  token: string;
  buyer: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

// ======================================
// Verify Reset Token — GET /buyer/auth/verify-reset-token
// (new — this endpoint wasn't covered before)
// ======================================
export interface VerifyResetTokenResponse {
  valid: boolean;
  message: string;
}

// ======================================
// Session check — GET /buyer/auth/me
// This is the RAW envelope the backend sends. In practice you never see this
// shape in application code: the axios response interceptor in https.ts
// unwraps `response.data.data` whenever a `data` key is present, so
// useGetAuth() (in auth-context.tsx) actually receives just the inner
// `data` object, typed there as `AuthUser`. Kept here for reference only.
// ======================================
export interface UserAuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: "admin" | "buyer";
    displayName: string;
    avatar: string | null;
  };
}