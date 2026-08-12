"use client";

import React from "react";
import Link from "next/link";
import { Package, CheckCircle } from "lucide-react";
import { AppImage } from "@/components/ui/AppImage";
import StockBadge from "@/components/StockBadge";
import type { Product, ProductVariant } from "@/types/product";

interface ProductInfoColumnProps {
  productInfoRef: React.RefObject<HTMLDivElement>;
  currentProduct: Product;
  labels: Array<{ text: string; variant?: string }>;
  heroContent: { subtitle?: string; ctaText?: string; ctaLink?: string };
  normalizedFeatures: string[];
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (variant: ProductVariant) => void;
  isSubscribe: boolean;
  setIsSubscribe: (value: boolean) => void;
  activeSubscription: any;
  setShowSubscriptionModal: (value: boolean) => void;
  effectiveSubscriptionDiscountPercent: number;
  subscriptionPrice: string;
  quantity: number;
  setQuantity: (value: number) => void;
  qtyMax: number;
  outOfStock: boolean;
  lowStock: boolean;
  stockQty: number;
  cartUniqueCount: number;
  currentPrice: string | undefined;
  handleAddToCart: () => void;
  openAccordion: string | null;
  setOpenAccordion: (key: string | null) => void;
  ingredients: Array<{ name: string; description?: string } | string>;
  hasDeliveryRule: boolean;
  hasInsuranceDetails: boolean;
  normalizedFeaturesAll: string[];
  renderStars: (rating: number, size?: "sm" | "md") => React.ReactNode;
  averageRatingValue: string;
  totalReviews: number;
  hasReviews: boolean;
}

export const ProductInfoColumn: React.FC<ProductInfoColumnProps> = ({
  productInfoRef,
  currentProduct,
  labels,
  heroContent,
  normalizedFeatures,
  variants,
  selectedVariant,
  setSelectedVariant,
  isSubscribe,
  setIsSubscribe,
  activeSubscription,
  setShowSubscriptionModal,
  effectiveSubscriptionDiscountPercent,
  subscriptionPrice,
  quantity,
  setQuantity,
  qtyMax,
  outOfStock,
  lowStock,
  stockQty,
  cartUniqueCount,
  currentPrice,
  handleAddToCart,
  openAccordion,
  setOpenAccordion,
  ingredients,
  hasDeliveryRule,
  hasInsuranceDetails,
  normalizedFeaturesAll,
  renderStars,
  averageRatingValue,
  totalReviews,
  hasReviews,
}) => {
  const labelColors: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: "#1a1a1a", text: "#ffffff", border: "#1a1a1a" },
    green: { bg: "#166534", text: "#ffffff", border: "#166534" },
    blue: { bg: "#1e40af", text: "#ffffff", border: "#1e40af" },
    orange: { bg: "#c2410c", text: "#ffffff", border: "#c2410c" },
    purple: { bg: "#6b21a8", text: "#ffffff", border: "#6b21a8" },
  };

  return (
    <div ref={productInfoRef} className="flex flex-col gap-5 animate-[fadeUp_0.55s_0.1s_ease_both]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#a89880]">
        <Link href="/" className="hover:text-[#8b6240] transition-colors">Home</Link>
        <span className="text-[#e0d5c5]">/</span>
        <Link href="/products" className="hover:text-[#8b6240] transition-colors">Products</Link>
        <span className="text-[#e0d5c5]">/</span>
        <span className="text-[#7a6558]">
          {currentProduct.category?.name || currentProduct.category}
        </span>
      </nav>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {labels.map((label, i) => {
            const colors = labelColors[label.variant || "primary"] || labelColors.primary;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.3px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1.5px solid ${colors.border}`,
                }}
              >
                {label.text}
              </span>
            );
          })}
        </div>
      )}

      {/* Title */}
      <h1 className="font-playfair text-2xl sm:text-3xl lg:text-[2.8rem] font-black text-[#1a1208] leading-tight tracking-[-0.4px]">
        {currentProduct.name}
      </h1>

      {/* Subtitle */}
      {heroContent.subtitle && (
        <p className="text-sm font-medium text-[#7a6558] -mt-2 tracking-[0.3px]">
          {heroContent.subtitle}
        </p>
      )}

      {/* Feature Pills */}
      {normalizedFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {normalizedFeatures.slice(0, 3).map((f, i) => (
            <span key={i} className="text-xs font-semibold text-[#7a5c3c] bg-[#f1ece4] border border-[#e0d5c5] rounded-full px-3 py-1">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      {(hasReviews || totalReviews > 0) && (
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">{renderStars(currentProduct.averageRating || 0, "sm")}</div>
          <span className="text-sm font-medium text-[#7a6558]">
            {averageRatingValue} ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {/* Stock Badge */}
      {!outOfStock && lowStock && (
        <div className="mb-4">
          <StockBadge product={currentProduct} size="md" />
        </div>
      )}
      {outOfStock && (
        <div className="mb-4">
          <StockBadge product={currentProduct} showOk={false} size="md" />
        </div>
      )}

      {/* Stock Availability */}
      {!outOfStock && (
        <div className="flex items-center gap-1.5 text-sm font-semibold mb-4">
          {stockQty <= 10 ? (
            <Package size={15} className="text-amber-600" />
          ) : (
            <CheckCircle size={15} className="text-emerald-700" />
          )}
          <span className={stockQty <= 10 ? "text-amber-600" : "text-emerald-700"}>
            {stockQty} units available
          </span>
        </div>
      )}

      {/* Variants */}
      {variants.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#a89880] mb-2">Flavour</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border-[1.5px] text-sm font-medium transition-all ${
                  selectedVariant?.name === variant.name
                    ? "border-[#8b6240] bg-[#f1ece4] text-[#8b6240] shadow-[0_0_0_3px_rgba(139,98,64,0.12)]"
                    : "border-[#e5ddd0] text-[#4a3a28] hover:border-[#b58a62]"
                }`}
              >
                {variant.image && (
                  <AppImage
                    src={variant.image}
                    alt={variant.name}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded object-cover"
                    iconSize={12}
                  />
                )}
                <span>{variant.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Block */}
      <div className="flex flex-col gap-2">
        {/* One-time Purchase */}
        <button
          type="button"
          onClick={() => setIsSubscribe(false)}
          className={`flex items-center gap-3 p-4 rounded-lg border-[1.5px] transition-all w-full text-left min-h-[68px] ${
            !isSubscribe
              ? "border-[#8b6240] bg-[#f1ece4] shadow-[0_0_0_3px_rgba(139,98,64,0.12)]"
              : "border-[#e5ddd0] hover:border-[#b58a62] hover:bg-[#f7f4ef]"
          }`}
        >
          <span className="w-[18px] h-[18px] border-2 border-[#ccc0ae] rounded-full flex items-center justify-center bg-white flex-shrink-0">
            {!isSubscribe && <span className="w-2 h-2 bg-[#8b6240] rounded-full animate-[radioIn_0.2s_ease_both]" />}
          </span>
          <span className="text-sm font-semibold text-[#2e2015] flex-1">One-time Purchase</span>
          <span className="font-playfair text-lg font-bold text-[#1a1208]">
            ${currentProduct.price?.toFixed(2)}
          </span>
        </button>

        {/* Subscribe & Save */}
        <button
          type="button"
          onClick={() => {
            if (activeSubscription?.isValid) setIsSubscribe(true);
            else setShowSubscriptionModal(true);
          }}
          className={`flex items-center gap-3 p-4 rounded-lg border-[1.5px] transition-all w-full text-left min-h-[68px] ${
            isSubscribe
              ? "border-[#8b6240] bg-[#f1ece4] shadow-[0_0_0_3px_rgba(139,98,64,0.12)]"
              : "border-[#e5ddd0] hover:border-[#b58a62] hover:bg-[#f7f4ef]"
          }`}
        >
          <span className="w-[18px] h-[18px] border-2 border-[#ccc0ae] rounded-full flex items-center justify-center bg-white flex-shrink-0">
            {isSubscribe && <span className="w-2 h-2 bg-[#8b6240] rounded-full animate-[radioIn_0.2s_ease_both]" />}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#2e2015]">Subscribe & Save</span>
              {effectiveSubscriptionDiscountPercent > 0 && (
                <span className="text-[0.65rem] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded">
                  SAVE {effectiveSubscriptionDiscountPercent}%
                </span>
              )}
            </div>
            <span className="text-xs text-[#7a6558]">Cancel anytime · No commitment</span>
          </div>
          {activeSubscription?.isValid ? (
            <span className="font-playfair text-lg font-bold text-[#1a1208]">${subscriptionPrice}</span>
          ) : (
            <span className="text-xs font-semibold text-[#8b6240] flex-shrink-0">View Plans →</span>
          )}
        </button>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-[2px] text-[#a89880]">Quantity</span>
        <div className="flex items-center border-[1.5px] border-[#e5ddd0] rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || outOfStock}
            className="w-[42px] h-[42px] bg-[#f7f4ef] text-[#2e2015] text-xl flex items-center justify-center hover:bg-[#1a1208] hover:text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            −
          </button>
          <input
            type="number"
            className="w-[52px] text-center text-sm font-semibold text-[#1a1208] bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={quantity}
            min="1"
            max={qtyMax || 10}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= (qtyMax || 10)) setQuantity(val);
            }}
            disabled={outOfStock}
          />
          <button
            type="button"
            onClick={() => setQuantity(Math.min(qtyMax || 10, quantity + 1))}
            disabled={quantity >= (qtyMax || 10) || outOfStock}
            className="w-[42px] h-[42px] bg-[#f7f4ef] text-[#2e2015] text-xl flex items-center justify-center hover:bg-[#1a1208] hover:text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        {lowStock && !outOfStock && (
          <span className="text-xs font-medium text-amber-600">⚠️ Only {stockQty} left</span>
        )}
      </div>

      {/* Cart Warnings */}
      {cartUniqueCount >= 25 && cartUniqueCount < 30 && (
        <div className="text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          ⚠️ Your cart has {cartUniqueCount} different products. Maximum limit is 30.
        </div>
      )}
      {cartUniqueCount >= 30 && (
        <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          ⚠️ Cart full! Remove some items before adding more.
        </div>
      )}

      {/* CTA Button */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`w-full py-4 px-6 bg-[#1a1208] text-white border-none rounded-lg font-bold text-sm tracking-[0.4px] transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            outOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {outOfStock ? "Out of Stock" : `Add to Cart · $${(parseFloat(currentPrice || "0") * quantity).toFixed(2)}`}
        </button>
        {heroContent.ctaText && heroContent.ctaLink && (
          <a
            href={heroContent.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 bg-transparent text-[#2e2015] border-[1.5px] border-[#ccc0ae] rounded-lg font-semibold text-sm text-center transition-all hover:bg-[#f7f4ef] hover:border-[#8b6240]"
          >
            {heroContent.ctaText}
          </a>
        )}
      </div>

      {/* Accordions */}
      <div className="border-t border-[#e5ddd0]">
        {[
          { key: "description", label: "Description" },
          { key: "ingredients", label: "Ingredients" },
          { key: "shipping", label: "Shipping" },
          { key: "insurance", label: "Insurance" },
        ].map(({ key, label }) => (
          <div key={key} className="border-b border-[#e5ddd0]">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
              className="w-full flex justify-between items-center py-4 bg-transparent border-none cursor-pointer font-outfit font-semibold text-sm text-[#2e2015] hover:text-[#8b6240] transition-colors"
            >
              <span>{label}</span>
              <span className="text-xl font-light text-[#8b6240]">
                {openAccordion === key ? "−" : "+"}
              </span>
            </button>
            {openAccordion === key && (
              <div className="pb-4 animate-[slideDown_0.25s_ease_both]">
                {key === "description" && (
                  <>
                    <p className="text-sm text-[#4a3a28] leading-relaxed">
                      {currentProduct.description || "No description available."}
                    </p>
                    {normalizedFeaturesAll.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {normalizedFeaturesAll.map((f, i) => (
                          <li key={i} className="text-sm text-[#4a3a28] flex items-center gap-2">
                            <span className="text-[#b58a62] text-xs">✦</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                {key === "ingredients" && (
                  <div className="space-y-3">
                    {ingredients.length > 0 ? (
                      ingredients.map((ing, i) => {
                        const name = typeof ing === "string" ? ing : ing.name;
                        const desc = typeof ing === "object" ? ing.description : null;
                        return (
                          <div key={i} className="border-b border-[#e5ddd0] last:border-0 pb-3 last:pb-0">
                            <strong className="text-sm font-semibold text-[#2e2015] block">{name}</strong>
                            {desc && <span className="text-sm text-[#7a6558] block">{desc}</span>}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-[#7a6558]">Ingredients information not available.</p>
                    )}
                  </div>
                )}
                {key === "shipping" && (
                  <div className="space-y-2 text-sm text-[#4a3a28]">
                    <p>Free shipping on orders over $50. Standard delivery 3–5 business days.</p>
                    {currentProduct.deliveryCharges > 0 && (
                      <p>Delivery charges: ${currentProduct.deliveryCharges?.toFixed(2)}</p>
                    )}
                    {hasDeliveryRule && <p>{currentProduct.deliveryRule}</p>}
                  </div>
                )}
                {key === "insurance" && (
                  <p className="text-sm text-[#4a3a28]">
                    {hasInsuranceDetails ? currentProduct.insuranceDetails : "Insurance information not available."}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};