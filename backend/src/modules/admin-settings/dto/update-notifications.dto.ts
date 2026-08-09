import { z } from 'zod';

export const UpdateNotificationsSchema = z.object({
  emailAlerts: z.boolean().optional(),
  orderAlerts: z.boolean().optional(),
  lowStockAlerts: z.boolean().optional(),
  customerAlerts: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
});

export type UpdateNotificationsDto = z.infer<
  typeof UpdateNotificationsSchema
>;