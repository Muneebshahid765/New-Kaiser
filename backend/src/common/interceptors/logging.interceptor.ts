/*eslint-disable*/
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RequestUser } from '../decorators/current-user.decorator';
import './request-id.interceptor'; // brings in the `request.id` type augmentation

const SLOW_REQUEST_THRESHOLD_MS = 200;

/**
 * Body/query keys that must never reach the logs, even truncated —
 * covers Admin/Buyer auth (password, 2FA), OTP flows (verificationCode),
 * and payment fields that might get proxied through a request body.
 */
const REDACTED_KEYS = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'otp',
  'verificationCode',
  'twoFactorSecret',
  'twoFactorCode',
  'cardNumber',
  'cvv',
]);

function redact(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const clone: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
  for (const key of Object.keys(clone)) {
    if (REDACTED_KEYS.has(key)) clone[key] = '[REDACTED]';
  }
  return clone;
}

interface RequestWithUser extends Request {
  user?: RequestUser;
}

/**
 * Structured request/response logging with per-request correlation ids.
 * Pairs with `RequestIdInterceptor` (registered first) so every log line
 * can be grepped by `requestId` across a distributed deployment.
 *
 * - Development: logs every request/response line.
 * - Production: stays quiet on the happy path, but always flags
 *   requests slower than `SLOW_REQUEST_THRESHOLD_MS` and always logs
 *   thrown errors — the two things worth paging someone about.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl, body } = request;
    const requestId = request.id ?? '-';
    const userId = request.user?.id ?? 'anonymous';
    const start = Date.now();
    const isProd = process.env.NODE_ENV === 'production';

    if (!isProd) {
      this.logger.log(
        `→ [${requestId}] ${method} ${originalUrl} user=${userId} body=${JSON.stringify(redact(body))}`,
      );
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;
        const line = `← [${requestId}] ${method} ${originalUrl} ${statusCode} ${duration}ms user=${userId}`;

        if (duration > SLOW_REQUEST_THRESHOLD_MS) {
          this.logger.warn(`🐌 SLOW ${line}`);
        } else if (!isProd) {
          this.logger.log(line);
        }
      }),
      catchError((err) => {
        const duration = Date.now() - start;
        this.logger.error(
          `✖ [${requestId}] ${method} ${originalUrl} ${duration}ms user=${userId} — ${err?.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}