// features/categories/types/category.types.ts
import { z } from "zod";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  QueryCategorySchema,
  BulkDeleteCategorySchema,
  BulkStatusCategorySchema,
} from "../schemas/category.schema";

export type CategoryStatus = "active" | "inactive";

export type CreateCategoryPayload = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof UpdateCategorySchema>;
export type QueryCategoryPayload = z.infer<typeof QueryCategorySchema>;
export type BulkDeleteCategoryPayload = z.infer<typeof BulkDeleteCategorySchema>;
export type BulkStatusCategoryPayload = z.infer<typeof BulkStatusCategorySchema>;