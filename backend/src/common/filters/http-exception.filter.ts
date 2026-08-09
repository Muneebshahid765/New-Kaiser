/*eslint-disable*/
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import '../interceptors/request-id.interceptor'; // brings in the `request.id` type augmentation

interface HttpExceptionBody {
  message?: string | string[];
  errors?: unknown[];
  error?: string;
}

/**
 * Normalizes every `HttpException` (thrown by guards, pipes — including
 * `ZodValidationPipe` — and controllers, e.g. `UnauthorizedException`
 * from `JwtAuthGuard`, `ForbiddenException` from `RolesGuard`,
 * `BadRequestException` from a validation failure) into one response
 * shape:
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "errors": [ ... ],
 *   "requestId": "…",
 *   "timestamp": "…",
 *   "path": "/api/auth/login"
 * }
 * ```
 * Deliberately out of scope: Prisma errors (`PrismaExceptionFilter`) and
 * truly unexpected errors (`AllExceptionsFilter`). Register all three
 * together — Nest dispatches to whichever filter's `@Catch()` matches
 * the thrown exception type.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    let message: string | string[];
    let errors: unknown[] | undefined;

    if (typeof body === 'object' && body !== null) {
      const typed = body as HttpExceptionBody;
      message = typed.message ?? exception.message;
      errors = typed.errors;
    } else {
      message = body as string;
    }

    // 5xx thrown deliberately as an HttpException (e.g. a 503 during
    // maintenance) still deserves a stack trace; 4xx is normal client noise.
    if (status >= 500) {
      this.logger.error(
        `[${request.id ?? '-'}] ${request.method} ${request.originalUrl} → ${status}`,
        exception.stack,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      ...(errors && errors.length ? { errors } : {}),
      requestId: request.id,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}