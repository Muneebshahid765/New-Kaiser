/* eslint-disable */
import { z } from 'zod';

export const UpdateThemeSchema = z.object({
  mode: z.enum(['light', 'dark', 'auto']).optional(),
  sidebarCollapsed: z.boolean().optional(),
});

export type UpdateThemeDto = z.infer<typeof UpdateThemeSchema>;