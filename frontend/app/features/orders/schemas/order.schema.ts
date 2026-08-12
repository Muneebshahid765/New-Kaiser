import { z } from "zod";

// ─── Shared Enums ───────────────────────────────────────────────────────────
export const OrderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const PaymentStatusEnum = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const PaymentMethodEnum = z.enum(["card", "cod", "bank_transfer"]);

// ─── Nested Item & Address Schemas ──────────────────────────────────────────
export const OrderItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID required hai"),
  quantity: z.number().int().min(1, "Kam az kam 1 quantity honi chahiye"),
});

export const ShippingAddressSchema = z.object({
  address1: z.string().min(3, "Address line 1 zaroori hai"),
  address2: z.string().optional(),
  city: z.string().min(2, "City zaroori hai"),
  state: z.string().min(2, "State zaroori hai"),
  postalCode: z.string().min(3, "Postal code zaroori hai"),
  country: z.string().default("Pakistan"),
});

// ─── Create Order ───────────────────────────────────────────────────────────
export const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Customer ka naam zaroori hai"),
  customerEmail: z.string().email("Valid email address daalein"),
  customerPhone: z.string().min(10, "Valid phone number daalein"),
  shippingAddress: ShippingAddressSchema,
  items: z.array(OrderItemInputSchema).min(1, "Order mein kam az kam 1 item hona chahiye"),
  paymentMethod: PaymentMethodEnum.default("card"),
  orderNotes: z.string().optional(),
});

// ─── Update Status ──────────────────────────────────────────────────────────
export const UpdateOrderStatusSchema = z.object({
  orderStatus: OrderStatusEnum,
  paymentStatus: PaymentStatusEnum.optional(),
  notes: z.string().optional(),
});

// ─── Cancel Order ───────────────────────────────────────────────────────────
export const CancelOrderSchema = z.object({
  reason: z.string().min(3, "Cancellation reason batana zaroori hai"),
});

// ─── Query / Filters (List Endpoint) ───────────────────────────────────────
export const QueryOrderSchema = z.object({
  status: z.union([OrderStatusEnum, z.literal("all")]).optional(),
  paymentStatus: z.union([PaymentStatusEnum, z.literal("all")]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});