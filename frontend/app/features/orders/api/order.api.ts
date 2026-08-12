import { get, post, put, del } from "@/services/https";
import type {
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
  QueryOrderPayload,
} from "../types/order.type";
import type {
  OrderListItem,
  OrderDetail,
  OrderMessageResponse,
  OrdersSummaryResponse,
} from "../types/order-response.types";

// ─── List Orders ─────────────────────────────────────────────────────────────
export const getOrders = (query?: QueryOrderPayload) =>
  get<OrderListItem[]>("/orders", { params: query });

// ─── Single Order Detail ─────────────────────────────────────────────────────
export const getOrderById = (id: string) =>
  get<OrderDetail>(`/orders/${id}`);

// ─── Create Order ────────────────────────────────────────────────────────────
export const createOrder = (payload: CreateOrderPayload) =>
  post<OrderDetail>("/orders", payload);

// ─── Update Order Status ─────────────────────────────────────────────────────
export const updateOrderStatus = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateOrderStatusPayload;
}) => put<OrderMessageResponse>(`/orders/${id}/status`, payload);

// ─── Cancel Order ────────────────────────────────────────────────────────────
export const cancelOrder = ({
  id,
  payload,
}: {
  id: string;
  payload: CancelOrderPayload;
}) => put<OrderMessageResponse>(`/orders/${id}/cancel`, payload);

// ─── Order Summary / Analytics ───────────────────────────────────────────────
export const getOrdersSummary = () =>
  get<OrdersSummaryResponse>("/orders/summary");