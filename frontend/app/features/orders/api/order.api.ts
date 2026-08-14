import { get, post, put } from "@/services/https";
import type {
  UpdateOrderStatusPayload,
  QueryOrderPayload,
} from "../schemas/order.schema";
import type {
  GetAllOrdersResponse,
  OrderDetailsResponse,
  OrderMessageResponse,
  OrdersStatisticsResponse,
} from "../types/order-response.types";

// ─── 1. Get All Orders (Admin) ────────────────────────────────────────────────
export const getAllOrders = (query?: QueryOrderPayload) => {
  // Convert frontend startDate/endDate to backend dateFrom/dateTo if needed
  const params = {
    ...query,
    dateFrom: query?.startDate ?? query?.dateFrom,
    dateTo: query?.endDate ?? query?.dateTo,
  };
  return get<GetAllOrdersResponse>("/orders/all-orders", { params });
};

// ─── 2. Single Order Details (Admin) ─────────────────────────────────────────
export const getOrderDetails = (orderId: string) =>
  get<OrderDetailsResponse>(`/orders/details/${orderId}`);

// ─── 3. Update Order Status (Admin) ──────────────────────────────────────────
export const updateOrderStatus = ({
  orderId,
  payload,
}: {
  orderId: string;
  payload: UpdateOrderStatusPayload;
}) => put<OrderMessageResponse>(`/orders/update-status/${orderId}`, payload);

// ─── 4. Cancel Payment / Order (Admin) ────────────────────────────────────────
export const cancelPayment = (orderId: string) =>
  post<OrderMessageResponse>("/orders/cancel-payment", { orderId });

// ─── 5. Order Status Check (Public) ──────────────────────────────────────────
export const getOrderStatus = (orderId: string) =>
  get<any>(`/orders/order-status/${orderId}`);

// ─── 6. Statistics (Admin) ───────────────────────────────────────────────────
export const getStatistics = () =>
  get<OrdersStatisticsResponse>("/orders/statistics");