import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelPayment,
  getStatistics,
} from "../api/order.api";
import type { QueryOrderPayload, UpdateOrderStatusPayload } from "../schemas/order.schema";
import type {
  GetAllOrdersResponse,
  OrderDetailsResponse,
  OrderMessageResponse,
  OrdersStatisticsResponse,
} from "../types/order-response.types";

export const ORDER_LIST_ROOT = ["orders", "list"] as const;
export const ORDER_LIST_KEY = (query?: QueryOrderPayload) => [...ORDER_LIST_ROOT, query ?? {}] as const;
export const ORDER_DETAIL_KEY = (id: string) => ["orders", "detail", id] as const;
export const ORDER_STATS_KEY = ["orders", "statistics"] as const;

// ─── Fetch All Orders with Pagination & Stats ─────────────────────────────
export function useOrders(query?: QueryOrderPayload) {
  return useQuery<GetAllOrdersResponse, Error>({
    queryKey: ORDER_LIST_KEY(query),
    queryFn: () => getAllOrders(query),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

// ─── Fetch Single Order Details ─────────────────────────────────────────────
export function useOrderDetails(id?: string) {
  return useQuery<OrderDetailsResponse, Error>({
    queryKey: ORDER_DETAIL_KEY(id ?? ""),
    queryFn: () => getOrderDetails(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Update Order Status Mutation ───────────────────────────────────────────
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutationWithToast<
    OrderMessageResponse,
    { id: string; payload: UpdateOrderStatusPayload }
  >(
    ({ id, payload }) => updateOrderStatus({ orderId: id, payload }),
    {
      successMsg: "Order status updated successfully.",
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ORDER_LIST_ROOT });
        queryClient.invalidateQueries({ queryKey: ORDER_DETAIL_KEY(variables.id) });
        queryClient.invalidateQueries({ queryKey: ORDER_STATS_KEY });
      },
    }
  );
}

// ─── Cancel Payment Mutation ────────────────────────────────────────────────
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutationWithToast<OrderMessageResponse, { id: string }>(
    ({ id }) => cancelPayment(id),
    {
      successMsg: "Payment cancelled successfully.",
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ORDER_LIST_ROOT });
        queryClient.invalidateQueries({ queryKey: ORDER_DETAIL_KEY(variables.id) });
        queryClient.invalidateQueries({ queryKey: ORDER_STATS_KEY });
      },
    }
  );
}

// ─── Standalone Statistics Hook ─────────────────────────────────────────────
export function useOrdersStatistics() {
  return useQuery<OrdersStatisticsResponse, Error>({
    queryKey: ORDER_STATS_KEY,
    queryFn: getStatistics,
    staleTime: 1000 * 60 * 5,
  });
}