import { z } from 'zod';
import { CategoryStatus } from '@prisma/client';

export const CategoryStatusEnum = z.nativeEnum(CategoryStatus);

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  status: CategoryStatusEnum.optional().default(CategoryStatus.active),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const QueryCategorySchema = z.object({
  status: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
});

export const BulkDeleteCategorySchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID format')),
  force: z.boolean().optional().default(false),
});

export const BulkStatusCategorySchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID format')),
  status: CategoryStatusEnum,
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type QueryCategoryDto = z.infer<typeof QueryCategorySchema>;
export type BulkDeleteCategoryDto = z.infer<typeof BulkDeleteCategorySchema>;
export type BulkStatusCategoryDto = z.infer<typeof BulkStatusCategorySchema>;