import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrdersSummary,
} from "../api/order.api";
import type {
  QueryOrderPayload,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  CancelOrderPayload,
} from "../types/order.type";
import type {
  OrderListItem,
  OrderDetail,
  OrderMessageResponse,
  OrdersSummaryResponse,
} from "../types/order-response.types";

// ─── Canonical Query Keys ─────────────────────────────────────────────────────
const ORDER_LIST_ROOT = ["orders", "list"] as const;
export const ORDER_LIST_KEY = (query?: QueryOrderPayload) =>
  [...ORDER_LIST_ROOT, query ?? {}] as const;
export const ORDER_DETAIL_KEY = (id: string) => ["orders", "detail", id] as const;
export const ORDER_SUMMARY_KEY = ["orders", "summary"] as const;

// ─── List Orders Hook ─────────────────────────────────────────────────────────
export function useOrders(query?: QueryOrderPayload) {
  return useQuery<OrderListItem[], Error>({
    queryKey: ORDER_LIST_KEY(query),
    queryFn: () => getOrders(query),
    select: (res: any) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.orders)) return res.orders;
      return [];
    },
    staleTime: 1_000 * 60 * 2,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Single Order Hook ────────────────────────────────────────────────────────
export function useOrder(id?: string) {
  return useQuery<OrderDetail, Error>({
    queryKey: ORDER_DETAIL_KEY(id ?? ""),
    queryFn: () => getOrderById(id!),
    enabled: Boolean(id),
    staleTime: 1_000 * 60 * 5,
    retry: false,
  });
}

// ─── Create Order Mutation ────────────────────────────────────────────────────
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutationWithToast<OrderDetail, CreateOrderPayload>(createOrder, {
    successMsg: "Order placed successfully.",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_LIST_ROOT });
      queryClient.invalidateQueries({ queryKey: ORDER_SUMMARY_KEY });
    },
  });
}

// ─── Update Status Mutation ───────────────────────────────────────────────────
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutationWithToast<
    OrderMessageResponse,
    { id: string; payload: UpdateOrderStatusPayload }
  >(updateOrderStatus, {
    successMsg: "Order status updated successfully.",
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_LIST_ROOT });
      queryClient.invalidateQueries({ queryKey: ORDER_DETAIL_KEY(variables.id) });
      queryClient.invalidateQueries({ queryKey: ORDER_SUMMARY_KEY });
    },
  });
}

// ─── Cancel Order Mutation ────────────────────────────────────────────────────
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutationWithToast<
    OrderMessageResponse,
    { id: string; payload: CancelOrderPayload }
  >(cancelOrder, {
    successMsg: "Order cancelled successfully.",
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_LIST_ROOT });
      queryClient.invalidateQueries({ queryKey: ORDER_DETAIL_KEY(variables.id) });
      queryClient.invalidateQueries({ queryKey: ORDER_SUMMARY_KEY });
    },
  });
}

// ─── Orders Summary Hook ──────────────────────────────────────────────────────
export function useOrdersSummary() {
  return useQuery<OrdersSummaryResponse, Error>({
    queryKey: ORDER_SUMMARY_KEY,
    queryFn: getOrdersSummary,
    staleTime: 1_000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}