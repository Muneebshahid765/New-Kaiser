// ─── Create Payment Intent Response ──────────────────────────────────────────
export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  message: string;
}

// ─── Order detail payload inside payment verification response ───────────────
export interface VerifiedPaymentOrder {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
}

// ─── Verify Payment Response ──────────────────────────────────────────────────
export interface VerifyPaymentResponse {
  success: boolean;
  status: "completed" | "processing" | "succeeded" | string;
  message: string;
  order?: VerifiedPaymentOrder;
}