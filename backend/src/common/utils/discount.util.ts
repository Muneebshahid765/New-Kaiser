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

export async function fetchActiveSiteWideDiscount(prisma: PrismaService): Promise<number> {
  const settings = await prisma.adminSettings.findFirst()
  
  if (
    settings?.discountEnabled &&
    settings.discountEndDate &&
    new Date() < new Date(settings.discountEndDate)
  ) {
    return Number(settings.discountPercentage) || 0
  }

  return 0
}