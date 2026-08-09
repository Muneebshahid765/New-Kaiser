import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password is required'),

  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long'),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;