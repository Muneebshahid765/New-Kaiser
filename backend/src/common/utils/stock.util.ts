/*eslint-disable*/
import { PrismaService } from "src/core/database/prisma.service";
import { CacheService } from "src/core/cache/redis/cache.service";

export interface StockItemInput {
  productId: string;
  quantity: number;
}

export interface StockError {
  productId: string;
  productName?: string;
  requested?: number;
  available?: number;
  reason: string;
}

/**
 * Decrement stock safely with condition stockQuantity >= quantity
 */
export async function decrementStock(
  prisma: PrismaService,
  cacheService: CacheService,
  items: StockItemInput[],
): Promise<StockError[]> {
  const errors: StockError[] = [];

  for (const item of items) {
    if (!item.productId) continue;
    const qty = item.quantity || 1;

    try {
      // Atomic update in Prisma
      const updated = await prisma.product.updateMany({
        where: {
          id: item.productId,
          deleted: false,
          stockQuantity: { gte: qty },
        },
        data: {
          stockQuantity: { decrement: qty },
        },
      });

      if (updated.count === 0) {
        const p = await prisma.product.findFirst({
          where: { id: item.productId, deleted: false },
          select: { name: true, stockQuantity: true },
        });

        errors.push({
          productId: item.productId,
          productName: p?.name || 'Unknown Product',
          requested: qty,
          available: p?.stockQuantity ?? 0,
          reason: !p
            ? 'Product not found'
            : `Insufficient stock (${p.stockQuantity} left)`,
        });
      }
    } catch (err: any) {
      errors.push({ productId: item.productId, reason: err.message });
    }
  }

  if (items.length > 0) {
    await cacheService.delByPattern('products:*');
  }

  return errors;
}

/**
 * Increment stock safely (e.g. order cancel / refund)
 */
export async function incrementStock(
  prisma: PrismaService,
  cacheService: CacheService,
  items: StockItemInput[],
): Promise<StockError[]> {
  const errors: StockError[] = [];

  for (const item of items) {
    try {
      const updated = await prisma.product.updateMany({
        where: { id: item.productId, deleted: false },
        data: { stockQuantity: { increment: item.quantity } },
      });

      if (updated.count === 0) {
        errors.push({ productId: item.productId, reason: 'Product not found' });
      }
    } catch (err: any) {
      errors.push({ productId: item.productId, reason: err.message });
    }
  }

  if (items.length > 0) {
    await cacheService.delByPattern('products:*');
  }

  return errors;
}