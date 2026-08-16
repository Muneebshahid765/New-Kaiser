import { z } from "zod";

export const ReviewStatusEnum = z.enum(["pending", "approved", "rejected"]);

export const QueryAdminReviewsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  status: ReviewStatusEnum.optional(),
  search: z.string().trim().optional(),
});

export const UpdateReviewStatusSchema = z.object({
  status: ReviewStatusEnum,
});

export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;
export type QueryAdminReviewsPayload = z.infer<typeof QueryAdminReviewsSchema>;
export type UpdateReviewStatusPayload = z.infer<typeof UpdateReviewStatusSchema>;