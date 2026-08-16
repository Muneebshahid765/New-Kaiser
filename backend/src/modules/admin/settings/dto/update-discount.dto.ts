import { z } from 'zod';

export const UpdateSiteWideDiscountSchema = z
  .object({
    enabled: z.boolean().optional(),
    percentage: z.number().min(0).max(90).optional(),
    bannerText: z.string().max(120).optional(),
    startDate: z.string().datetime().nullable().optional(),
    endDate: z.string().datetime().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date cannot be later than end date',
      path: ['startDate'],
    },
  );

export type UpdateSiteWideDiscountDto = z.infer<
  typeof UpdateSiteWideDiscountSchema
>;