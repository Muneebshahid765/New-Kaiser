import { z } from 'zod';


export const SubmitReviewSchema = z.object({
  productId: z.string().min(1, "Product ID or slug is required"), // `.uuid()` removed
  orderId: z.string().uuid("Invalid orderId UUID format"),
  email: z.string().email("Invalid customer email address"),
  userName: z.string().min(1, "User name is required").max(150),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});

export const CanReviewSchema = z.object({
  productId: z.string().uuid(),
  email: z.string().email(),
  orderId: z.string().uuid().optional(),
});

export const getProductReviewsSchema = z.object({
  cursor: z.string().uuid().optional(),

  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type SubmitReviewDto = z.infer<typeof SubmitReviewSchema>;
export type CanReviewDto = z.infer<typeof CanReviewSchema>;
export type GetProductReviewsDto = z.infer<typeof getProductReviewsSchema>;
