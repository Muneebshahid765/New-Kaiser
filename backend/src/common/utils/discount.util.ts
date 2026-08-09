// src/common/utils/discount.util.ts

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