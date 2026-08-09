/* eslint-disable */
// src/modules/products/dto/bulk-update-product.dto.ts
import { z } from "zod";
import { ProductLabelSchema, UpdateProductSchema } from "./create-product.dto";

export const BulkUpdateProductSchema = z.object({
  productIds: z
    .array(z.string().uuid("Invalid Product ID format"))
    .min(1, "At least one product must be selected"),
  updates: UpdateProductSchema.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for bulk update",
  }),
});

export type BulkUpdateProductDto = z.infer<typeof BulkUpdateProductSchema>;