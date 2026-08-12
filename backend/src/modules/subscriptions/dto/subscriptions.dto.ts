import { z } from 'zod'

export const CreatePlanSchema = z.object({
  name:           z.string().min(1, 'Name required').max(100).trim(),
  description:    z.string().max(500).trim().optional().default(''),
  price:          z.number().nonnegative('Price must be ≥ 0'),
  originalPrice:  z.number().nonnegative().optional(),
  duration:       z.number().int().min(1, 'Duration must be ≥ 1'),
  durationType:   z.enum(['days','weeks','months','years']),
  features:       z.array(z.string().max(200)).optional().default([]),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  isPopular:      z.boolean().optional().default(false),
  isActive:       z.boolean().optional().default(true),
  sortOrder:      z.number().int().optional().default(0),
  badge:          z.string().max(50).optional(),
  color:          z.string().max(20).optional().default('#8B7355'),
})

export const UpdatePlanSchema = CreatePlanSchema.partial()

export const BulkStatusSchema = z.object({
  ids:    z.array(z.string().uuid()).min(1),
  status: z.enum(['active', 'inactive']),
})

export const GetSubscribersFilterSchema = z.object({
  status: z.enum(['active','cancelled','expired','pending']).optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
})

export type CreatePlanDto              = z.infer<typeof CreatePlanSchema>
export type UpdatePlanDto              = z.infer<typeof UpdatePlanSchema>
export type GetSubscribersFilterDto    = z.infer<typeof GetSubscribersFilterSchema>