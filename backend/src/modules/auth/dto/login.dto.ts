/*eslint-disable*/
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      error: 'Email is required',
    })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),

  password: z
    .string({
      error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
});

export type LoginDtoType = z.infer<typeof loginSchema>;