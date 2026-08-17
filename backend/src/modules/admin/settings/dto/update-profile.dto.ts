/* eslint-disable */
import { z } from 'zod';

export const UpdateAdminProfileSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
  })
  .refine((d) => d.name !== undefined || d.email !== undefined, {
    message: 'At least one of name or email must be provided',
  });

export type UpdateAdminProfileDto = z.infer<typeof UpdateAdminProfileSchema>;

export const UpdateSecuritySettingsSchema = z.object({
  sessionTimeoutMin: z.coerce.number().int().min(1).max(1440).optional(),
});

export type UpdateSecuritySettingsDto = z.infer<typeof UpdateSecuritySettingsSchema>;