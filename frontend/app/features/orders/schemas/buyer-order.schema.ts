import { z } from "zod";

export const orderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = z.enum([
  "cod",
  "card",
  "bank_transfer",
  "digital_wallet",
  "installments",
]);

export const paymentStatusEnum = z.enum([
  "pending",
  "paid",
  "refunded",
  "partially_refunded",
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;

// Query Filters DTO Schema
export const getBuyerOrdersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  orderStatus: z.union([orderStatusEnum, z.literal("all")]).optional(),
});

export type GetBuyerOrdersQueryParams = z.infer<typeof getBuyerOrdersQuerySchema>;