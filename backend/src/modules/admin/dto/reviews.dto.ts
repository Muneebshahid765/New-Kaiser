import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

export const UpdateReviewStatusSchema = z.object({
  status: z.nativeEnum(ReviewStatus, {
    error: 'Status must be pending, approved, or rejected',
  }),
});

export const QueryAdminReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(ReviewStatus).optional(),
  search: z.string().trim().optional(),
});



export type UpdateReviewStatusDto = z.infer<typeof UpdateReviewStatusSchema>;

export type QueryAdminReviewsDto = z.infer<typeof QueryAdminReviewsSchema>;