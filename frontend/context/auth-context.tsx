/* eslint-disable */
/**
 * @file auth-context.tsx
 *
 * ─── SINGLE SOURCE OF TRUTH ───────────────────────────────────────────────────
 *
 * This file owns:
 *   1. The AuthUser type
 *   2. The ONLY useGetAuth() React-Query hook  ← all other files import from here
 *   3. AuthContext + AuthProvider
 *   4. useAuth() convenience hook
 *
 * ─── PATH FIX ──────────────────────────────────────────────────────────────
 * useGetAuth() used to call "/auth/me". The real controller is
 * BuyerAuthController @Controller('buyer/auth'), so the actual route is
 * "/buyer/auth/me" — fixed below. Note this one handler's displayName/avatar
 * logic already branches on `user.role === 'admin'`, so it appears to be the
 * single shared "who am I" check for both buyer and admin sessions, despite
 * living under the buyer/auth prefix. If an equivalent /admin/auth/me ever
 * gets added, point this at whichever one is actually meant to be shared.
 *
 * Double-API-call prevention:
 *   staleTime = 14 min → within a page session React-Query never re-fetches
 *   unless the cache is explicitly invalidated (e.g. after login/logout).
 *
 * Race-condition / infinite-redirect prevention:
 *   - hasRedirected ref: fires the redirect exactly once per provider mount.
 *   - isFetching guard: while Axios interceptor is silently refreshing tokens
 *     isFetching stays true; we don't redirect until it settles.
 *   - router.replace (not push): back-button cannot return to protected page.
 */
"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { get } from "@/services/https";

// ─── Auth User Type (shared everywhere) ──────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "buyer";
  displayName: string;
  avatar: string | null;
}

// ─── Canonical Query Key ──────────────────────────────────────────────────────
// ONE key across the entire app. Never redeclare this elsewhere.
export const AUTH_QUERY_KEY = ["auth", "me"] as const;

// ─── THE One True useGetAuth ──────────────────────────────────────────────────
/**
 * All hooks and components that need the current user call this.
 * Because React-Query deduplicates by queryKey, N consumers = 1 network request.
 */
// auth-context.tsx
export function useGetAuth() {
  return useQuery<AuthUser, Error>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await get<any>("/buyer/auth/me");
      // Agar API nested format (res.data.data) mein user de rahi hai:
      return response?.data?.data || response?.data || response;
    },
    staleTime: 1_000 * 60 * 14,
    gcTime: 1_000 * 60 * 30,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// ─── Context Shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Protected-route prefixes (mirrored from middleware) ──────────────────────
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/automation"] as const;
const isProtected = (p: string) => PROTECTED_PREFIXES.some((r) => p.startsWith(r));

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError, isFetching, refetch } = useGetAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const hasRedirected = useRef(false); // prevents double-redirect in StrictMode

  // ── Redirect guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const shouldRedirect =
      isError && // definitive failure (not just loading)
      !isFetching && // Axios interceptor has settled (no silent refresh)
      !user && // no cached user either
      isProtected(pathname) &&
      !hasRedirected.current;

    if (!shouldRedirect) return;

    hasRedirected.current = true;
    queryClient.clear(); // wipe cache before navigation to prevent re-triggers
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }, [isError, isFetching, user, pathname, queryClient, router]);

  // Reset guard when user comes back (login without hard refresh)
  useEffect(() => {
    if (user) hasRedirected.current = false;
  }, [user]);

  // ── Loading skeleton — first-paint only, never on background re-fetch ───────
  if (isLoading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Convenience hook ─────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}