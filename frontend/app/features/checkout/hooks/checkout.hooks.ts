import { useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import { createPaymentIntent, verifyPayment } from "../api/checkout.api";
import type {
  CreatePaymentIntentPayload,
  VerifyPaymentPayload,
} from "../types/checkout.type";
import type {
  CreatePaymentIntentResponse,
  VerifyPaymentResponse,
} from "../types/checkout-response.types";

// ─── Canonical Query Keys ─────────────────────────────────────────────────────
export const VERIFY_PAYMENT_KEY = (paymentIntentId: string) =>
  ["checkout", "verify-payment", paymentIntentId] as const;

// ─── Create Payment Intent Mutation Hook ──────────────────────────────────────
export function useCreatePaymentIntent() {
  return useMutationWithToast<CreatePaymentIntentResponse, CreatePaymentIntentPayload>(
    createPaymentIntent,
    {
      successMsg: "Payment initialized.",
    },
  );
}

// ─── Verify Payment Mutation Hook (For Manual/Action Submits) ─────────────────
export function useVerifyPaymentMutation() {
  return useMutationWithToast<VerifyPaymentResponse, VerifyPaymentPayload>(
    verifyPayment,
    {
      successMsg: "Payment status verified.",
    },
  );
}

// ─── Verify Payment Polling Query Hook (For Success/Redirect Page) ────────────
export function useVerifyPaymentQuery(paymentIntentId?: string) {
  return useQuery<VerifyPaymentResponse, Error>({
    queryKey: VERIFY_PAYMENT_KEY(paymentIntentId ?? ""),
    queryFn: () => verifyPayment({ paymentIntentId: paymentIntentId! }),
    enabled: Boolean(paymentIntentId),
    staleTime: 0,
    // Polling until webhook creates order or returns completed
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.order) {
        return false; // Stop polling
      }
      return 2500; // Poll every 2.5 seconds
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}