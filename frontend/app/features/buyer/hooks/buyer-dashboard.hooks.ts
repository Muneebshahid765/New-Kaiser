import { useQuery } from "@tanstack/react-query";
import type { DashboardQueryParams } from "../schemas/buyer-dashboard.schema";
import type { GetBuyerDashboardResponse } from "../types/buyer-dashboard-response.types";
import { getBuyerDashboardOverview } from "../api/buyer-dashboard.api";

export const BUYER_DASHBOARD_KEY = (params?: DashboardQueryParams) =>
  ["buyer-dashboard", params] as const;

export function useBuyerDashboard(params?: DashboardQueryParams) {
  return useQuery<GetBuyerDashboardResponse, Error>({
    queryKey: BUYER_DASHBOARD_KEY(params),
    queryFn: () => getBuyerDashboardOverview(params),
    staleTime: 1000 * 60 * 3, // 3 Minutes cache
    refetchOnWindowFocus: false,
  });
}