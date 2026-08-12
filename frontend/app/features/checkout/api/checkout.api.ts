import { post } from "@/services/https";
import type {
  CreatePaymentIntentPayload,
  VerifyPaymentPayload,
} from "../types/checkout.type";
import type {
  CreatePaymentIntentResponse,
  VerifyPaymentResponse,
} from "../types/checkout-response.types";

// ─── Create Payment Intent API ────────────────────────────────────────────────
export const createPaymentIntent = (payload: CreatePaymentIntentPayload) =>
  post<CreatePaymentIntentResponse>("/orders/create-payment-intent", payload);

// ─── Verify Payment API ───────────────────────────────────────────────────────
export const verifyPayment = (payload: VerifyPaymentPayload) =>
  post<VerifyPaymentResponse>("/orders/verify-payment", payload);