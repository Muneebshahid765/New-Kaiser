/*eslint-disable*/
import { PrismaService } from 'src/core/database/prisma.service'
import { CacheService }  from 'src/core/cache/redis/cache.service'

export interface StockItem  { productId: string; quantity: number }
export interface StockError { productId: string; productName?: string; requested?: number; available?: number; reason: string }

export async function decrementStock(
  prisma:  PrismaService,
  cache:   CacheService,
  items:   StockItem[],
): Promise<StockError[]> {
  const errors: StockError[] = []

  for (const { productId, quantity } of items) {
    if (!productId) continue
    const qty = quantity || 1
    try {
      const updated = await prisma.product.updateMany({
        where: { id: productId, deleted: false, stockQuantity: { gte: qty } },
        data:  { stockQuantity: { decrement: qty } },
      })

      if (updated.count === 0) {
        const p = await prisma.product.findFirst({
          where:  { id: productId, deleted: false },
          select: { name: true, stockQuantity: true },
        })
        errors.push({
          productId,
          productName: p?.name ?? 'Unknown',
          requested:   qty,
          available:   p?.stockQuantity ?? 0,
          reason:      !p ? 'Product not found' : `Insufficient stock (${p.stockQuantity} left)`,
        })
      }
    } catch (err: any) {
      errors.push({ productId, reason: err.message })
    }
  }

  if (items.length > 0) await cache.delByPattern('products:*')
  return errors
}

export async function incrementStock(
  prisma:  PrismaService,
  cache:   CacheService,
  items:   StockItem[],
): Promise<StockError[]> {
  const errors: StockError[] = []

  for (const { productId, quantity } of items) {
    try {
      const updated = await prisma.product.updateMany({
        where: { id: productId, deleted: false },
        data:  { stockQuantity: { increment: quantity } },
      })
      if (updated.count === 0) errors.push({ productId, reason: 'Product not found' })
    } catch (err: any) {
      errors.push({ productId, reason: err.message })
    }
  }

  if (items.length > 0) await cache.delByPattern('products:*')
  return errors
}