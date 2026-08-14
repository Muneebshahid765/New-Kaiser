import { get, patch } from "@/services/https";
import type { GetBuyerOrdersQueryParams } from "../schemas/buyer-order.schema";
import type {
  GetBuyerOrdersResponse,
  GetBuyerOrderDetailResponse,
  CancelBuyerOrderResponse,
} from "../types/buyer-order-response.types";

// ─── 1. Get My Orders (Buyer) ────────────────────────────────────────────────
export const getMyOrders = (query?: GetBuyerOrdersQueryParams) =>
  get<GetBuyerOrdersResponse>("/buyer/orders", { params: query });

// ─── 2. Single Order Details (Buyer) ─────────────────────────────────────────
export const getMyOrderDetail = (orderId: string) =>
  get<GetBuyerOrderDetailResponse>(`/buyer/orders/${orderId}`);

// ─── 3. Cancel Order (Buyer) ─────────────────────────────────────────────────
export const cancelMyOrder = (orderId: string) =>
  patch<CancelBuyerOrderResponse>(`/buyer/orders/${orderId}/cancel`);