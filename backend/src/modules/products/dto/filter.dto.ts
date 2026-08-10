import { z } from 'zod';

export const GetProductsFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().default(25),

  category: z.string().optional(),

  search: z.string().optional(),

  minPrice: z.coerce.number().nonnegative().optional(),

  maxPrice: z.coerce.number().nonnegative().optional(),

  stockFilter: z
    .enum(['instock', 'outofstock', 'lowstock'])
    .optional(),

  onSale: z.coerce.boolean().optional(),

  minRating: z.coerce.number().min(0).max(5).optional(),

  sort: z.string().optional(),
});

export type GetProductsFilter = z.infer<typeof GetProductsFilterSchema>;