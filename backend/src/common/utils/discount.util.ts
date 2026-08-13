/*eslint-disable*/
// src/common/utils/discount.util.ts

import { PrismaService } from "src/core/database/prisma.service";

export interface DiscountedProduct<T> {
  transformed: T;
  appliedDiscount: number;
}

/**
 * Applies a percentage global site-wide discount to a product's price.
 */
export function calculateGlobalDiscount<T extends Record<string, any>>(
  product: T,
  discountPercent: number,
) {
  if (!discountPercent || discountPercent <= 0) {
    return product;
  }

  const originalPrice = Number(product.price);
  const discountedPrice = originalPrice - (originalPrice * discountPercent) / 100;

  return {
    ...product,
    originalPrice: product.originalPrice || originalPrice,
    price: Math.round(discountedPrice),
    appliedDiscount: discountPercent,
  };
}

// Optimized discount.util.ts
export async function fetchActiveSiteWideDiscount(
  prisma: PrismaService,
  cacheService?: any,
): Promise<number> {
  const cacheKey = 'settings:discount:active';

  if (cacheService) {
    const cached = await cacheService.get(cacheKey);
    if (cached !== null && cached !== undefined) {
      return typeof cached === 'string' ? Number(cached) : cached;
    }
  }

  const settings = await prisma.adminSettings.findFirst({
    select: { discountEnabled: true, discountEndDate: true, discountPercentage: true },
  });

  let discount = 0;
  if (
    settings?.discountEnabled &&
    settings.discountEndDate &&
    new Date() < new Date(settings.discountEndDate)
  ) {
    discount = Number(settings.discountPercentage) || 0;
  }

  if (cacheService) {
    await cacheService.setex(cacheKey, 120, discount); // Cache for 2 minutes
  }

  return discount;
}