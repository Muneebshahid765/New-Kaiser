import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const getBuyerOrdersSchema = z.object({
  page: z
    .coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10),

  orderStatus: z
    .union([z.nativeEnum(OrderStatus), z.literal('all')]) 
    .optional(),
});

export type GetBuyerOrdersDto = z.infer<typeof getBuyerOrdersSchema>;