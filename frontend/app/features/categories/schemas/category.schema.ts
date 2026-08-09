// features/categories/schemas/category.schema.ts
import { z } from "zod";

// ─── Shared ────────────────────────────────────────────────────────────────
export const CategoryStatusEnum = z.enum(["active", "inactive"]);

// ─── Create ────────────────────────────────────────────────────────────────
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category ka naam kam az kam 2 characters ka ho")
    .max(100, "Category ka naam 100 characters se ziada nahi ho sakta"),

  description: z
    .string()
    .min(1, "Description daalna zaroori hai"),

  status: CategoryStatusEnum.default("active"),
});

export type CategoryFormData = z.infer<typeof CreateCategorySchema>;

// ─── Update (sab fields optional — sirf jo bhejo wo update ho) ──────────────
export const UpdateCategorySchema = CreateCategorySchema.partial();

// ─── Query / Filters (list endpoint) ────────────────────────────────────────
export const QueryCategorySchema = z.object({
  status: z.union([CategoryStatusEnum, z.literal("all")]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// ─── Bulk Delete ─────────────────────────────────────────────────────────────
export const BulkDeleteCategorySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Kam az kam 1 category select karo"),
  force: z.boolean().optional(),
});

// ─── Bulk Status Update ──────────────────────────────────────────────────────
export const BulkStatusCategorySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Kam az kam 1 category select karo"),
  status: CategoryStatusEnum,
});