/*eslint-disable*/
import { z } from 'zod';

export const UpdateAdminProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50)
    .optional(),

  email: z
    .string()
    .email('Invalid email address')
    .optional(),
});

export type UpdateAdminProfileDto = z.infer<
  typeof UpdateAdminProfileSchema
>;


export const UpdateSecuritySettingsSchema = z.object({
  sessionTimeoutMin: z
    .number()
    .int()
    .min(5)
    .max(120)
    .optional(),
});

export type UpdateSecuritySettingsDto = z.infer<
  typeof UpdateSecuritySettingsSchema
>;