"use client";

import React, { useState } from "react";

interface Review {
  _id?: string;
  userName?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

interface ReviewsSectionProps {
  currentProduct: any;
  averageRatingValue: string;
  totalReviews: number;
  hasReviews: boolean;
  safeReviewsArray: Review[];
  ratingBreakdown: Array<{ star: number; count: number; percent: number }>;
  positivePercent: number;
  mostCommonStar: number;
  renderStars: (rating: number, size?: "sm" | "md") => React.ReactNode;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  currentProduct,
  averageRatingValue,
  totalReviews,
  hasReviews,
  safeReviewsArray,
  ratingBreakdown,
  positivePercent,
  mostCommonStar,
  renderStars,
}) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleReviews = safeReviewsArray.slice(0, visibleCount);
  const hasMore = visibleCount < safeReviewsArray.length;

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208] mb-8">
          Customer Reviews
        </h2>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 p-6 sm:p-9 bg-gradient-to-br from-[#f8f4ee]/95 to-[#ebdfd1]/95 border border-[#e5ddd0] rounded-3xl shadow-[0_30px_60px_rgba(88,69,49,0.08)] relative overflow-hidden mb-10">
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[0.74rem] uppercase tracking-[2px] text-[#a89880] font-bold">
              Overall Experience
            </p>
            <div className="flex items-center gap-4">
              <span className="font-playfair text-5xl sm:text-[4.5rem] font-bold text-[#1a1208] leading-none">
                {averageRatingValue}
              </span>
              <div>
                <div className="flex gap-0.5">{renderStars(currentProduct?.averageRating || 0, "sm")}</div>
                <p className="text-sm text-[#7a6558]">
                  {hasReviews
                    ? `Based on ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}`
                    : "No reviews yet"}
                </p>
              </div>
            </div>
            {hasReviews ? (
              <ul className="space-y-2 text-sm text-[#2e2015]">
                <li className="flex items-center gap-2.5 p-2.5 bg-white/50 rounded-lg border border-white/60">
                  <span className="w-7 h-7 rounded-full bg-white border border-black/5 flex items-center justify-center text-sm shadow-[0_4px_10px_rgba(0,0,0,0.07)]">
                    ✓
                  </span>
                  <span>
                    <strong className="text-lg text-[#603e20]">{positivePercent}%</strong> recommend this product
                  </span>
                </li>
                <li className="flex items-center gap-2.5 p-2.5 bg-white/50 rounded-lg border border-white/60">
                  <span className="w-7 h-7 rounded-full bg-white border border-black/5 flex items-center justify-center text-sm shadow-[0_4px_10px_rgba(0,0,0,0.07)]">
                    ★
                  </span>
                  <span>
                    <strong className="text-lg text-[#603e20]">{mostCommonStar} ★</strong> most common rating
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-sm text-[#7a6558]">Be the first to share your experience.</p>
            )}
          </div>

          {/* Rating Bars */}
          <div className="relative z-10 flex flex-col gap-2 py-3">
            {ratingBreakdown.map(({ star, percent, count }) => {
              const fillWidth = count > 0 ? Math.max(percent, 6) : 0;
              return (
                <div key={star} className="grid grid-cols-[46px_1fr_50px_32px] items-center gap-3 py-1.5">
                  <span className="text-xs text-[#7a6558]">{star} ★</span>
                  <div className="h-1.5 bg-[#e0d5c5] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
                    <div
                      className="h-full bg-gradient-to-r from-[#8b6240] to-[#b58a62] rounded-full animate-[barFill_0.8s_ease_both]"
                      style={{ width: `${fillWidth}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#2e2015] text-right">{percent}%</span>
                  <span className="text-xs text-[#2e2015] font-semibold text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review List */}
        {hasReviews && (
          <>
            <div className="border-t border-[#e5ddd0]">
              {visibleReviews.map((review, i) => (
                <article
                  key={review._id || i}
                  className="grid grid-cols-1 sm:grid-cols-[180px_1fr_100px] gap-4 sm:gap-6 py-6 border-b border-[#e5ddd0] hover:bg-[#f7f4ef] hover:px-3 hover:-mx-3 rounded-lg transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#3d2810] text-white font-playfair text-lg font-bold flex items-center justify-center flex-shrink-0">
                      {review.userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2e2015] m-0">
                        {review.userName || "Anonymous"}
                      </p>
                      <p className="text-[0.7rem] font-semibold text-emerald-700 m-0">✓ Verified Buyer</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex gap-0.5">{renderStars(review.rating, "sm")}</div>
                      {review.title && <span className="text-sm font-semibold text-[#2e2015]">{review.title}</span>}
                    </div>
                    <p className="text-sm text-[#4a3a28] leading-relaxed m-0">{review.comment}</p>
                  </div>
                  <div className="text-xs text-[#a89880] italic">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently"}
                  </div>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="px-7 py-2.5 border border-[#d1d5db] rounded-lg bg-white text-sm text-[#374151] transition-all hover:bg-[#f9fafb] hover:border-[#9ca3af]"
                >
                  Load More ({safeReviewsArray.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};