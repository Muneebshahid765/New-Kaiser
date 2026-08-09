/*eslint-disable*/
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

/** Header both read from an upstream proxy/gateway and echoed back to the client. */
export const REQUEST_ID_HEADER = 'x-request-id';

declare module 'express' {
  interface Request {
    /** Correlation id for this request — reused by LoggingInterceptor and all exception filters. */
    id?: string;
  }
}

/**
 * Ensures every request carries a correlation id — reusing one supplied
 * by an upstream load balancer/gateway when present, generating a fresh
 * uuid otherwise. The id is stamped on `request.id` and echoed back as a
 * response header, so a single failed checkout, review submission, or
 * subscription webhook can be traced across logs, error reports, and
 * support tickets.
 *
 * Register this before `LoggingInterceptor` in main.ts:
 * ```ts
 * app.useGlobalInterceptors(
 *   new RequestIdInterceptor(),
 *   new LoggingInterceptor(),
 *   new ResponseInterceptor(),
 * );
 * ```
 *
 * Note: if a request id is also needed *inside guards* (which run
 * before interceptors), promote this same logic into
 * `request-id.middleware.ts` as well — middleware runs earliest in the
 * pipeline, before guards, pipes, and interceptors.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (!request.id) {
      const incoming = request.headers[REQUEST_ID_HEADER];
      request.id = (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();
    }

    response.setHeader(REQUEST_ID_HEADER, request.id);

    return next.handle();
  }
}