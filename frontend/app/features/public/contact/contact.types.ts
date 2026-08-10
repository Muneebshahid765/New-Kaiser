import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{6,14}$/;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be between 2 and 100 characters')
    .max(100, 'Name must be between 2 and 100 characters'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  phone: z
    .string()
    .trim()
    .refine((val) => phoneRegex.test(val.replace(/[\s()\-]/g, '')), {
      message: 'Please provide a valid phone number with country code',
    }),

  message: z
    .string()
    .trim()
    .min(10, 'Message must be between 10 and 1000 characters')
    .max(1000, 'Message must be between 10 and 1000 characters'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;