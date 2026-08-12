import { z } from 'zod'

export const GetOrdersFilterSchema = z.object({
  page:          z.coerce.number().int().positive().default(1),
  limit:         z.coerce.number().int().positive().max(100).default(20),
  orderStatus:   z.enum(['pending','confirmed','processing','shipped','delivered','cancelled']).optional(),
  paymentStatus: z.enum(['pending','paid','refunded','partially_refunded']).optional(),
  sortBy:        z.enum(['createdAt','totalAmount','customerName']).optional().default('createdAt'),
  sortOrder:     z.enum(['asc','desc']).optional().default('desc'),
  search:        z.string().trim().max(100).optional(),
  dateFrom:      z.string().datetime().optional(),
  dateTo:        z.string().datetime().optional(),
})

export const UpdateOrderStatusSchema = z.object({
  orderStatus: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled']),
})

export const CancelPaymentSchema = z.object({
  orderId: z.string().uuid(),
})

export type GetOrdersFilterDto    = z.infer<typeof GetOrdersFilterSchema>
export type UpdateOrderStatusDto  = z.infer<typeof UpdateOrderStatusSchema>
export type CancelPaymentDto      = z.infer<typeof CancelPaymentSchema>