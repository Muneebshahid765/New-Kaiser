/*eslint-disable*/
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import './request-id.interceptor'; // brings in the `request.id` type augmentation

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface StandardResponse<T> {
  success: true;
  statusCode: number;
  requestId?: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

function isPaginated(value: unknown): value is Paginated<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as Paginated<unknown>).items) &&
    typeof (value as Paginated<unknown>).meta === 'object'
  );
}

/**
 * Wraps every successful response in one consistent envelope so the
 * frontend never has to guess the shape:
 * ```json
 * { "success": true, "statusCode": 200, "data": { ... }, "timestamp": "..." }
 * ```
 * Paginated results (as returned by `pagination.util.ts` for endpoints
 * like product/order/review listing) are unwrapped into `data` (the
 * array) plus a top-level `meta` — so list endpoints and single-resource
 * endpoints share one envelope shape instead of nesting `data.data.items`.
 *
 * File/stream responses (image asset uploads, generated PDFs, the
 * Stripe webhook's raw ack) should bypass this — either exclude the
 * route via `@UseInterceptors` at the controller level, or write
 * directly to the raw `Response` object, since this interceptor assumes
 * a JSON-serializable payload.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((result) => {
        const statusCode = response.statusCode;
        const requestId = request.id;

        if (isPaginated(result)) {
          return {
            success: true as const,
            statusCode,
            requestId,
            data: result.items as T,
            meta: result.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true as const,
          statusCode,
          requestId,
          data: result,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}