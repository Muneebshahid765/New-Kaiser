import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast"; // Adjust path if needed
import { GetBuyerOrdersQueryParams } from "../schemas/buyer-order.schema";
import type {
  GetBuyerOrdersResponse,
  GetBuyerOrderDetailResponse,
  CancelBuyerOrderResponse,
} from "../types/buyer-order-response.types";
import { cancelMyOrder, getMyOrderDetail, getMyOrders } from "../api/buyer-order.api";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const BUYER_ORDERS_ROOT = ["buyer-orders"] as const;

export const BUYER_ORDERS_LIST_KEY = (query?: GetBuyerOrdersQueryParams) =>
  [...BUYER_ORDERS_ROOT, "list", query] as const;

export const BUYER_ORDER_DETAIL_KEY = (orderId?: string | null) =>
  [...BUYER_ORDERS_ROOT, "detail", orderId] as const;

// ─── 1. Get Buyer Orders List Hook ───────────────────────────────────────────
export function useBuyerOrders(params?: GetBuyerOrdersQueryParams) {
  return useQuery<GetBuyerOrdersResponse, Error>({
    queryKey: BUYER_ORDERS_LIST_KEY(params),
    queryFn: () => getMyOrders(params),
    placeholderData: (previousData) => previousData, // Seamless pagination transition
    staleTime: 1_000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

// ─── 2. Get Buyer Order Detail Hook ──────────────────────────────────────────
export function useBuyerOrderDetail(orderId?: string | null) {
  return useQuery<GetBuyerOrderDetailResponse, Error>({
    queryKey: BUYER_ORDER_DETAIL_KEY(orderId),
    queryFn: () => getMyOrderDetail(orderId!),
    enabled: Boolean(orderId),
    staleTime: 1_000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

// ─── 3. Cancel Order Hook (using useMutationWithToast) ───────────────────────
export function useCancelBuyerOrder() {
  const queryClient = useQueryClient();

  return useMutationWithToast<CancelBuyerOrderResponse, string>(
    (orderId: string) => cancelMyOrder(orderId),
    {
      successMsg: "Order cancelled successfully.",
      onSuccess: (_data, orderId) => {
        // Invalidate order list so it refetches fresh data
        queryClient.invalidateQueries({ queryKey: BUYER_ORDERS_ROOT });

        // Optimistically update active detail cache if it's currently open
        queryClient.setQueryData(
          BUYER_ORDER_DETAIL_KEY(orderId),
          (oldData: GetBuyerOrderDetailResponse | undefined) => {
            if (!oldData?.order) return oldData;
            return {
              ...oldData,
              order: {
                ...oldData.order,
                orderStatus: "cancelled",
              },
            };
          }
        );
      },
    }
  );
}