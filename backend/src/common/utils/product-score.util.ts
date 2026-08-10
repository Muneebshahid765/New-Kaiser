// utils/product-score.util.ts

export interface ScorableProduct {
  // Prisma Decimal object, number, string, ya null ko allow karne ke liye:
  averageRating?: number | string | { toString(): string } | null;
  totalReviews?: number | null;
  stockQuantity?: number | null;
  createdAt: Date | string;
}

/**
 * Reusable utility to calculate product ranking score
 */
export function calculateProductScore(
  product: ScorableProduct,
  nowTimestamp: number = new Date().getTime(),
): number {
  // Prisma Decimal instance ko safely number mein convert karna
  const rawRating = product.averageRating != null ? String(product.averageRating) : "0";
  const rating = Number(rawRating) || 0;

  const reviews = product.totalReviews || 0;
  const stock = product.stockQuantity || 0;

  // Calculate age in days
  const createdAtTime = new Date(product.createdAt).getTime();
  const ageInDays = (nowTimestamp - createdAtTime) / (1000 * 3600 * 24);

  // Scoring Weights
  const ratingScore = rating * 20; // 0 - 100 points
  const reviewScore = Math.min(reviews * 2.5, 50); // Max 50 points
  const stockScore = stock > 0 ? 30 : -50; // In-stock priority
  const recencyScore = Math.max(0, 15 - ageInDays * 0.5); // Max 15 points for new items

  return ratingScore + reviewScore + stockScore + recencyScore;
}