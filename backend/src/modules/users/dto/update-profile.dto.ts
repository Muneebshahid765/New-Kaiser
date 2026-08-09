/*eslint-disable*/

import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name cannot be empty')
    .max(40, 'First name cannot exceed 40 characters')
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(1, 'First name cannot be empty')
    .max(40, 'Last name cannot exceed 40 characters')
    .optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;