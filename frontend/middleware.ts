/* eslint-disable */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_PROTECTED_PREFIXES = ["/admin-dashboard", "/settings", "/automation"];
const BUYER_PROTECTED_PREFIXES = ["/dashboard", "/orders", "/profile"];
const AUTH_ONLY_PREFIXES = ["/login", "/admin/login"];

const ADMIN_AUTHENTICATED_REDIRECT = "/admin-dashboard";
const BUYER_AUTHENTICATED_REDIRECT = "/dashboard";

// ─── Dual Secrets (Admin = JWT_SECRET, Buyer = BUYER_JWT_SECRET) ──────────
const ADMIN_SECRET = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : null;

const BUYER_SECRET = process.env.BUYER_JWT_SECRET
  ? new TextEncoder().encode(process.env.BUYER_JWT_SECRET)
  : null;

type Role = "admin" | "buyer";

// ─── Safe Session Reader ───────────────────────────────────────────────────
async function readSession(
  req: NextRequest,
  cookieName: "admin_token" | "buyer_token"
): Promise<Role | null> {
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;

  const secret = cookieName === "admin_token" ? ADMIN_SECRET : BUYER_SECRET;
  const expectedRole: Role = cookieName === "admin_token" ? "admin" : "buyer";

  // Secret missing = hard fail (never soft-allow)
  if (!secret) {
    console.error(`[Middleware] Missing secret for ${cookieName}. Denying access.`);
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const role = (payload as any)?.role;

    // Role must match cookie type exactly
    if (role !== expectedRole) return null;

    return role;
  } catch {
    // Expired, tampered, wrong secret — all treated as no session
    return null;
  }
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// ─── Main Middleware ───────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = matchesPrefix(pathname, ADMIN_PROTECTED_PREFIXES);
  const isBuyerRoute = matchesPrefix(pathname, BUYER_PROTECTED_PREFIXES);
  const isAuthOnly   = matchesPrefix(pathname, AUTH_ONLY_PREFIXES);

  const adminRole = await readSession(req, "admin_token");
  const buyerRole = await readSession(req, "buyer_token");

  // 1. Auth-Only Routes (/login, /admin/login)
  if (isAuthOnly) {
    if (adminRole === "admin") {
      return NextResponse.redirect(new URL(ADMIN_AUTHENTICATED_REDIRECT, req.url));
    }
    if (buyerRole === "buyer") {
      return NextResponse.redirect(new URL(BUYER_AUTHENTICATED_REDIRECT, req.url));
    }
    return NextResponse.next();
  }

  // 2. Admin Protected Routes
  if (isAdminRoute) {
    if (adminRole === "admin") return NextResponse.next();

    // Buyer admin panel access karne ki koshish kare toh buyer dashboard
    if (buyerRole === "buyer") {
      return NextResponse.redirect(new URL(BUYER_AUTHENTICATED_REDIRECT, req.url));
    }

    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Buyer Protected Routes
  if (isBuyerRoute) {
    if (buyerRole === "buyer") return NextResponse.next();

    if (adminRole === "admin") {
      return NextResponse.redirect(new URL(ADMIN_AUTHENTICATED_REDIRECT, req.url));
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};