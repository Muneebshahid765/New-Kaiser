import { z } from "zod";
import {
  BulkUpdateProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "../schemas/product.schema";

export type CreateProductPayload = z.infer<typeof CreateProductSchema>;
export type UpdateProductPayload = z.infer<typeof UpdateProductSchema>;
export type BulkUpdateProductPayload = z.infer<typeof BulkUpdateProductSchema>;

export interface ProductApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}