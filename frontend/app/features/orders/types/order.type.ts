import { z } from "zod";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  CancelOrderSchema,
  QueryOrderSchema,
  OrderStatusEnum,
  PaymentStatusEnum,
  PaymentMethodEnum,
} from "../schemas/order.schema";

export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusPayload = z.infer<typeof UpdateOrderStatusSchema>;
export type CancelOrderPayload = z.infer<typeof CancelOrderSchema>;
export type QueryOrderPayload = z.infer<typeof QueryOrderSchema>;