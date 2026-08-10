import { z } from 'zod';

// Phone regex cleaner & validator
const phoneRegex = /^\+?[1-9]\d{6,14}$/;

export const createMessageSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(2, 'Name must be between 2 and 100 characters')
    .max(100, 'Name must be between 2 and 100 characters'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  phone: z
    .string({ error: 'Phone number is required' })
    .trim()
    .transform((val) => val.replace(/[\s()\-]/g, ''))
    .refine((val) => phoneRegex.test(val), {
      message: 'Please provide a valid phone number with country code',
    }),
  message: z
    .string({ error: 'Message is required' })
    .trim()
    .min(10, 'Message must be between 10 and 1000 characters')
    .max(1000, 'Message must be between 10 and 1000 characters'),
});

export const getMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['unread', 'read']).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().trim().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['unread', 'read'], {
    error: 'Invalid status. Must be "unread" or "read"',
  }),
});

export const replyMessageSchema = z.object({
  reply: z
    .string({ error: 'Reply message is required' })
    .trim()
    .min(10, 'Reply must be between 10 and 2000 characters')
    .max(2000, 'Reply must be between 10 and 2000 characters'),
});

export const bulkDeleteMessagesSchema = z.object({
  ids: z
    .array(z.string().uuid('Invalid UUID format'))
    .min(1, 'Please provide an array of message IDs'),
});

export type CreateMessageDto = z.infer<typeof createMessageSchema>;
export type GetMessagesQueryDto = z.infer<typeof getMessagesQuerySchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
export type ReplyMessageDto = z.infer<typeof replyMessageSchema>;
export type BulkDeleteMessagesDto = z.infer<typeof bulkDeleteMessagesSchema>;