/*eslint-disable*/
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import '../interceptors/request-id.interceptor'; // brings in the `request.id` type augmentation

/**
 * Buyer-facing translations for the `decline_code` / `code` values seen
 * most often on card payments — these are what drive `Order.paymentStatus`
 * and `Order.paymentIntentStatus` (which mirrors Stripe's own
 * PaymentIntent status names 1:1 in this schema).
 */
const DECLINE_MESSAGES: Record<string, string> = {
  insufficient_funds: 'Your card has insufficient funds.',
  card_declined: 'Your card was declined. Please try another payment method.',
  expired_card: 'Your card has expired.',
  incorrect_cvc: 'The card security code (CVC) is incorrect.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  incorrect_number: 'The card number is incorrect.',
};

/**
 * Translates errors thrown by the Stripe SDK — used across `Order`
 * (payment intents/charges) and `UserSubscription` (Stripe subscriptions
 * + webhooks) — into the app's standard error envelope.
 *
 * Stripe's own error hierarchy already separates "the buyer's card
 * failed" from "our integration sent a bad request" from "Stripe's API
 * is down"; this filter maps that hierarchy onto sensible HTTP statuses
 * instead of letting every Stripe error fall through to a generic 500 —
 * and, for `StripeSignatureVerificationError`, ensures a forged or
 * stale webhook call gets a clean 400 rather than crashing the handler.
 *
 * Register alongside `PrismaExceptionFilter`, before `HttpExceptionFilter`:
 * ```ts
 * app.useGlobalFilters(
 *   new PrismaExceptionFilter(),
 *   new StripeExceptionFilter(),
 *   new HttpExceptionFilter(),
 *   new AllExceptionsFilter(), // catch-all, always last
 * );
 * ```
 */
@Catch(Stripe.errors.StripeError)
export class StripeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StripeExceptionFilter.name);

  catch(exception: Stripe.errors.StripeError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);

    // Anything other than the buyer's own card being declined points at
    // either our integration or Stripe's infrastructure — worth a full log.
    if (!(exception instanceof Stripe.errors.StripeCardError)) {
      this.logger.error(
        `[${request.id ?? '-'}] ${request.method} ${request.originalUrl} — Stripe ${exception.type}: ${exception.message}`,
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

  private resolve(exception: Stripe.errors.StripeError): { status: number; message: string } {
    if (exception instanceof Stripe.errors.StripeCardError) {
      const friendly =
        (exception.decline_code && DECLINE_MESSAGES[exception.decline_code]) ??
        (exception.code && DECLINE_MESSAGES[exception.code]) ??
        exception.message ??
        'Your payment could not be processed.';
      return { status: HttpStatus.PAYMENT_REQUIRED, message: friendly };
    }

    if (exception instanceof Stripe.errors.StripeSignatureVerificationError) {
      // Webhook signature mismatch — forged request or a stale webhook secret.
      return { status: HttpStatus.BAD_REQUEST, message: 'Invalid webhook signature.' };
    }

    if (exception instanceof Stripe.errors.StripeInvalidRequestError) {
      // We sent Stripe a malformed request — a bug in our integration,
      // not something the buyer caused or can act on.
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'We could not process this payment request. Please try again.',
      };
    }

    if (exception instanceof Stripe.errors.StripeRateLimitError) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many payment requests. Please wait a moment and try again.',
      };
    }

    if (exception instanceof Stripe.errors.StripeConnectionError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Could not reach the payment provider. Please try again shortly.',
      };
    }

    if (exception instanceof Stripe.errors.StripeAuthenticationError) {
      // Misconfigured secret key on our side — never surface this detail to a client.
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Payment provider is temporarily unavailable.',
      };
    }

    // StripeAPIError, StripePermissionError, StripeIdempotencyError, or
    // anything future — Stripe's side, not the buyer's.
    return {
      status: HttpStatus.BAD_GATEWAY,
      message: 'The payment provider returned an unexpected error. Please try again.',
    };
  }
}