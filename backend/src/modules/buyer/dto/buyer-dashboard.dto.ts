import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 4))
    .refine((val) => val > 0 && val <= 20, {
      message: 'Limit must be between 1 and 20',
    }),
});

export type DashboardQueryDto = z.infer<typeof DashboardQuerySchema>;