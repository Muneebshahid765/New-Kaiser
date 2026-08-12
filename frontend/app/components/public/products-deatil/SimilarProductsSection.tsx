"use client";

import React from "react";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import StockBadge from "@/components/StockBadge";
import { isOutOfStock } from "@/utils/stockUtils";
import type { Product } from "@/types/product";

interface SimilarProductsSectionProps {
  similarProducts: Product[];
}

export const SimilarProductsSection: React.FC<SimilarProductsSectionProps> = ({
  similarProducts,
}) => {
  if (!similarProducts?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#f7f4ef] border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208]">
            Related Products
          </h2>
          <Link href="/products" className="text-sm font-semibold text-[#8b6240] border-b border-[#b58a62] hover:text-[#603e20] transition-colors">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {similarProducts.map((product, index) => {
            const outOfStock = isOutOfStock(product);
            const imageUrl = product.imageUrl
              ? product.imageUrl.startsWith("http")
                ? product.imageUrl
                : `${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`
              : product.images?.[0]?.url
              ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].url}`
              : "/products/placeholder.png";

            return (
              <Link
                key={product._id || index}
                href={`/product/${product.slug || product._id}`}
                className="bg-[#f7f4ef] border border-[#e5ddd0] rounded-xl overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(74,51,32,0.1)] hover:border-[#c8b99a]"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f1ece4]">
                  <AppImage
                    src={imageUrl}
                    alt={product.name}
                    width={300}
                    height={300}
                    className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                      outOfStock ? "opacity-50" : ""
                    }`}
                    iconSize={32}
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                      <span className="bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-xs tracking-wide transform -rotate-3 shadow-md">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-amber-600 mb-1.5">
                      {"★".repeat(Math.round(product.averageRating || 0))}
                      {"☆".repeat(5 - Math.round(product.averageRating || 0))}
                      <span className="text-xs text-[#a89880]">({product.totalReviews || 0})</span>
                    </div>
                  )}
                  <h4 className="font-playfair text-sm font-bold text-[#2e2015] line-clamp-2 mb-1.5">
                    {product.name}
                  </h4>
                  <span className="font-playfair text-base font-bold text-[#1a1208]">
                    ${(product.price || 0).toFixed(2)}
                  </span>
                  <div className="mt-2">
                    <StockBadge product={product} showOk={false} size="sm" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};