/*eslint-disable*/
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Field names that must never leave the server, no matter how deeply
 * nested inside a response payload. Matched against the exact camelCase
 * Prisma client property name (not the `@map`'d snake_case DB column),
 * since that's what controllers actually return.
 *
 * Driven directly by schema.prisma:
 * - `Admin`: password, twoFactorSecret, pendingTwoFactorSession/Expiry
 * - `Buyer`: password, passwordResetToken/Expires, verificationCode/Expires
 *
 * Extend this set if you add more secret-bearing columns later.
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordResetToken',
  'passwordResetExpires',
  'verificationCode',
  'verificationExpires',
  'twoFactorSecret',
  'pendingTwoFactorSession',
  'pendingTwoFactorExpiry',
]);

/** Recursion cap — guards against pathological payload shapes, not real ones. */
const MAX_DEPTH = 8;

/**
 * True only for plain `{ ... }` object literals (what Prisma returns for
 * models and JSON columns). Explicitly false for `Date`, `Buffer`, and
 * Prisma's `Decimal` (from decimal.js) — those are class instances with
 * their own prototype and, critically, their own `toJSON()`. Rebuilding
 * them as a plain object via `Object.entries` would strip that
 * prototype and corrupt serialization (a `Decimal` for `Product.price`
 * would come out as `{ s, e, d }` internals instead of `"12.34"`).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) continue; // drop entirely, don't just mask
    result[key] = sanitize(val, depth + 1);
  }
  return result;
}

/**
 * Deep-strips auth secrets (password hashes, reset tokens, OTP/2FA
 * codes) from every outgoing response, at any nesting depth.
 *
 * This is a *last line of defense*: DTOs/`select` clauses should
 * already exclude these columns at the Prisma query level. But a
 * `findUnique({ include: { buyer: true } })` on an `Order`, a nested
 * `Review.buyer`, or a stray `return admin;` left in during
 * development, should never be able to leak them just because a
 * relation was included.
 *
 * Order relative to `ResponseInterceptor` doesn't matter — this walks
 * the entire payload recursively (including inside a `{ data: ... }`
 * envelope), so it catches secrets whether they sit at the top level
 * or several relations deep.
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => sanitize(data)));
  }
}