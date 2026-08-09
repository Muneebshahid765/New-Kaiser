/*eslint-disable*/
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import '../interceptors/request-id.interceptor'; // brings in the `request.id` type augmentation

/**
 * Last-resort safety net for anything that isn't an `HttpException` or a
 * known Prisma error — a bug, a third-party SDK throwing a raw `Error`
 * (Stripe, bcrypt, jsonwebtoken), an unexpected `TypeError`, etc.
 *
 * Never leaks the raw error message/stack to the client — that's how
 * internal file paths, SQL, or schema details end up in a bug bounty
 * report — logs it in full server-side instead, keyed by `requestId`
 * so it can be cross-referenced with `LoggingInterceptor` output.
 *
 * Register this LAST among global filters so `PrismaExceptionFilter`
 * and `HttpExceptionFilter` get first refusal at exceptions they
 * specifically understand:
 * ```ts
 * app.useGlobalFilters(
 *   new PrismaExceptionFilter(),
 *   new HttpExceptionFilter(),
 *   new AllExceptionsFilter(), // catch-all, always last
 * );
 * ```
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('UnhandledException');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `[${request.id ?? '-'}] ${request.method} ${request.originalUrl} — unhandled exception`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong on our end. Please try again shortly.',
      requestId: request.id,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}