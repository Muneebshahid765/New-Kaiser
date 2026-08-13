import { z } from 'zod';

export const getProductReviewsSchema = z.object({
  cursor: z
    .string()
    .uuid()
    .optional(),

  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5),
});

export type GetProductReviewsDto = z.infer<
  typeof getProductReviewsSchema
>;