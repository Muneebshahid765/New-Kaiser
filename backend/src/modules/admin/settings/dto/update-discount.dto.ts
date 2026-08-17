/* eslint-disable */
import { z } from 'zod';

export const UpdateSiteWideDiscountSchema = z.object({
  enabled: z.boolean().optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  bannerText: z.string().max(120).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

export type UpdateSiteWideDiscountDto = z.infer<typeof UpdateSiteWideDiscountSchema>;