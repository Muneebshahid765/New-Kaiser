import { z } from "zod";

export const SubmitReviewSchema = z.object({
  productId: z.string().min(1, "Product ID or slug is required"),
  orderId: z.string().uuid("Invalid orderId UUID format"),
  email: z.string().email("Invalid customer email address"),
  userName: z.string().min(1, "User name is required").max(150),
  rating: z.number().int().min(1, "Rating min 1 hone chahiye").max(5, "Rating max 5 ho sakti hai"),
  comment: z.string().min(1, "Comment fill karna zaroori hai"),
});

export const CanReviewSchema = z.object({
  productId: z.string().min(1, "Product ID or slug is required"),
  email: z.string().email(),
  orderId: z.string().uuid().optional(),
});

export const QueryProductReviewsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).default(5),
});

export type SubmitReviewPayload = z.infer<typeof SubmitReviewSchema>;
export type CanReviewPayload = z.infer<typeof CanReviewSchema>;
export type QueryProductReviewsPayload = z.infer<typeof QueryProductReviewsSchema>;