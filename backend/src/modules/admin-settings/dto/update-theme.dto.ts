/*eslint-disable*/
import {z} from 'zod'
import { ThemeMode } from '@prisma/client';

export const UpdateThemeSchema = z.object({
  mode: z.nativeEnum(ThemeMode).optional(),
  sidebarCollapsed: z.boolean().optional(),
});

export type UpdateThemeDto = z.infer<
  typeof UpdateThemeSchema
>;