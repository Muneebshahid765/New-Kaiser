import { z } from "zod";

export const dashboardQuerySchema = z.object({
  limit: z.number().min(1).max(20).default(4),
});

export type DashboardQueryParams = z.infer<typeof dashboardQuerySchema>;