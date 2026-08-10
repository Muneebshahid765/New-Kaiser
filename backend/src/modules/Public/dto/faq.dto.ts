import { z } from 'zod';

export const createFaqSchema = z.object({
  question: z
    .string({ error: 'Question is required' })
    .trim()
    .min(3, 'Question must be at least 3 characters long')
    .max(300, 'Question cannot exceed 300 characters'),
  answer: z
    .string({ error: 'Answer is required' })
    .trim()
    .min(3, 'Answer must be at least 3 characters long')
    .max(2000, 'Answer cannot exceed 2000 characters'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateFaqSchema = createFaqSchema.partial();

export type CreateFaqDto = z.infer<typeof createFaqSchema>;
export type UpdateFaqDto = z.infer<typeof updateFaqSchema>;