/*eslint-disable*/
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import '../interceptors/request-id.interceptor'; // brings in the `request.id` type augmentation

/**
 * Friendly, user-facing labels for columns that show up in unique /
 * foreign-key violation metadata — keeps error messages readable
 * ("Email already in use") instead of leaking raw snake_case column
 * names. Extend as new `@unique` fields are added to schema.prisma.
 */
const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  sku: 'SKU',
  slug: 'Slug',
  name: 'Name',
  path: 'Image path',
  order_number: 'Order number',
  stripe_payment_intent_id: 'Payment reference',
  stripe_subscription_id: 'Subscription reference',
  stripe_customer_id: 'Stripe customer reference',
};

function labelFor(column: string): string {
  return FIELD_LABELS[column] ?? column;
}

/**
 * Translates Prisma's `PrismaClientKnownRequestError` /
 * `PrismaClientValidationError` / `PrismaClientInitializationError` into
 * the app's standard error envelope, so callers never see raw
 * Postgres/Prisma internals (constraint names, driver messages).
 *
 * Covers the error codes this schema is actually likely to throw:
 * - P2002 unique violations — `Buyer.email`, `Product.sku`/`slug`,
 *   `Category.name`/`slug`, `Order.orderNumber`, `ImageAsset.path`,
 *   Stripe id columns.
 * - P2003/P2014 relation violations — the deliberate `onDelete: Restrict`
 *   FKs (`Product.category`, `OrderItem.product`,
 *   `UserSubscription.plan`) that protect order/review history.
 * - P2025 — record not found for an update/delete/connect.
 *
 * Must be registered *before* `HttpExceptionFilter` / `AllExceptionsFilter`
 * in `app.useGlobalFilters(...)` so it gets first refusal on Prisma errors:
 * ```ts
 * app.useGlobalFilters(
 *   new PrismaExceptionFilter(),
 *   new HttpExceptionFilter(),
 *   new AllExceptionsFilter(), // catch-all, always last
 * );
 * ```
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientInitializationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `[${request.id ?? '-'}] ${request.method} ${request.originalUrl} — ${exception.name}`,
        exception.stack,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      requestId: request.id,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }

  private resolve(exception: unknown): { status: number; message: string } {
    if (exception instanceof Prisma.PrismaClientValidationError) {
      // Malformed query (wrong field name/type) — always a bug, never
      // something the client controls, but 400 keeps it off the 500 dashboard.
      return { status: HttpStatus.BAD_REQUEST, message: 'Invalid request data.' };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database is temporarily unavailable. Please try again shortly.',
      };
    }

    const err = exception as Prisma.PrismaClientKnownRequestError;

    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[] | string | undefined) ?? [];
        const fields = Array.isArray(target) ? target : [target];
        const labels = fields.filter(Boolean).map(labelFor).join(', ') || 'Field';
        return { status: HttpStatus.CONFLICT, message: `${labels} already in use.` };
      }

      case 'P2025': {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
        };
      }

      case 'P2003': {
        const field = (err.meta?.field_name as string | undefined) ?? '';
        return {
          status: HttpStatus.CONFLICT,
          message: field
            ? `This action is blocked because it's still referenced elsewhere (${field}).`
            : 'This action is blocked because related records still exist.',
        };
      }

      case 'P2014': {
        return {
          status: HttpStatus.CONFLICT,
          message: 'This change would violate a required relationship between records.',
        };
      }

      case 'P2000': {
        const column = (err.meta?.column_name as string | undefined) ?? 'value';
        return { status: HttpStatus.BAD_REQUEST, message: `${labelFor(column)} is too long.` };
      }

      case 'P2011': {
        const target = (err.meta?.target as string[] | string | undefined) ?? '';
        const field = Array.isArray(target) ? target[0] : target;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${labelFor(field ?? '')} is required.`,
        };
      }

      case 'P2021':
      case 'P2022': {
        // Table/column doesn't exist — schema drift between migration and
        // generated client. Always a deployment bug, worth a loud log.
        this.logger.error(`Schema drift detected: ${err.message}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A server configuration error occurred.',
        };
      }

      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred. Please try again.',
        };
      }
    }
  }
}