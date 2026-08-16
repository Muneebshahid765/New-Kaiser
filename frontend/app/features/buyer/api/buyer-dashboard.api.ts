import { get } from "@/services/https";
import type { DashboardQueryParams } from "../schemas/buyer-dashboard.schema";
import type { GetBuyerDashboardResponse } from "../types/buyer-dashboard-response.types";

export const getBuyerDashboardOverview = (params?: DashboardQueryParams) =>
  get<GetBuyerDashboardResponse>("/buyer/dashboard", { params });