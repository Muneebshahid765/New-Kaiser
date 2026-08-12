import { z } from "zod";

// ─── Payment Intent Item Input ───────────────────────────────────────────────
 export const CreatePaymentIntentItemSchema = z.object({
  product: z.string().min(1, "Product ID required hai"),
  productName: z.string().min(1, "Product name required hai"),
  price: z.coerce.number().min(0, "Price Positive Number honi chahiye"), // <-- z.coerce.number() string ko number banaye ga
  quantity: z.number().int().min(1, "Quantity kam az kam 1 honi chahiye"),
  isSubscription: z.boolean().optional().default(false),
});
// ─── Payment Intent Shipping Address ─────────────────────────────────────────
export const PaymentShippingAddressSchema = z.object({
  address1: z.string().min(3, "Address line 1 zaroori hai"),
  address2: z.string().optional(),
  city: z.string().min(2, "City zaroori hai"),
  state: z.string().min(2, "State zaroori hai"),
  postalCode: z.string().min(3, "Postal code zaroori hai"),
  country: z.string().optional().default("Pakistan"),
});

// ─── Create Payment Intent Payload Schema ────────────────────────────────────
export const CreatePaymentIntentSchema = z.object({
  customerName: z.string().min(2, "Customer name zaroori hai"),
  customerEmail: z.string().email("Valid email address daalein"),
  customerPhone: z.string().min(10, "Valid phone number daalein"),
  shippingAddress: PaymentShippingAddressSchema,
  items: z.array(CreatePaymentIntentItemSchema).min(1, "Items array khali nahi hona chahiye"),
  orderNotes: z.string().optional(),
  buyerId: z.string().optional(),
});

// ─── Verify Payment Payload Schema ───────────────────────────────────────────
export const VerifyPaymentSchema = z.object({
  paymentIntentId: z.string().regex(/^pi_[a-zA-Z0-9_]+$/, "Invalid Payment Intent ID format"),
});