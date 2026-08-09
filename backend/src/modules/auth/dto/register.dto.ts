/* eslint-disable */
import { z } from 'zod';

export const buyerRegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(40, 'First name must not exceed 40 characters')
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        'First name can only contain letters and spaces',
      ),

    lastName: z
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(40, 'Last name must not exceed 40 characters')
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        'Last name can only contain letters and spaces',
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(255, 'Email must not exceed 255 characters'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
      ),

  })


export type BuyerRegisterDto = z.infer<typeof buyerRegisterSchema>;