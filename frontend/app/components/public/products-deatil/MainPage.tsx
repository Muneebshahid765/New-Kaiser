"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ── Hooks & Stores ─────────────────────────────────────────────────────────────
import { usePublicProductDetail } from "@/app/features/products/hooks/public-product.hooks";
import { useCart } from "../../home/hooks/useCart";
import { modals } from "@/hooks/store/useModalStore";

// ── Components ────────────────────────────────────────────────────────────────
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfoColumn } from "./ProductInfoColumn";
import { LogoSliderSection } from "./LogoSliderSection";
import { HighlightsSection } from "./HighlightsSection";
import { DesignHighlightsSection } from "./DesignHighlightsSection";
import { SpecificationsSection } from "./SpecificationsSection";
import { PackageContentSection } from "./PackageContent";
import { UsageSection } from "./UsageSection";
import { FaqsSection } from "./FaqsSection";
import { ReviewsSection } from "./ReviewsSection";
import { SimilarProductsSection } from "./SimilarProductsSection";

// ── Utilities & Types ─────────────────────────────────────────────────────────
import type { PublicProductDetail } from "@/app/features/products/types/product-response.types";

// ── Stock Clamping Helper Function ──────────────────────────────
const clampToStock = (qty: number, product?: { stockQuantity?: number } | null): number => {
  if (!product) return 1;
  
  // Agar stockQuantity defined nahi hai to fallback 10 rakhein
  const maxStock = typeof product.stockQuantity === "number" ? product.stockQuantity : 10;
  
  // Stock agar 0 ya minus me ho to quantity 1 set karein
  if (maxStock <= 0) return 1;

  // Quantity ko 1 aur Max Available Stock ke beech lock (clamp) kar do
  return Math.min(Math.max(1, qty), maxStock);
};

const ProductDetailPage: React.FC = () => {
 
  const router = useRouter();

  // ── TanStack Query Hook (Fetches Product + Reviews + Similar in 1 optimized call) ─
   const { slug } = useParams<{ slug: string }>();
const { data, isLoading, isError } = usePublicProductDetail(slug);

  // ── Cart Hook & Global Modal Store ──
  const { cartItems, addToCart, cartUniqueCount } = useCart();

  // ── Local UI States ──
  const [quantity, setQuantity] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isNutritionExpanded, setIsNutritionExpanded] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const productInfoRef = useRef<HTMLDivElement>(null);

  // ── Destructure Response Payload ──
  const currentProduct: PublicProductDetail | undefined = data?.product;
  const safeReviewsArray = useMemo(() => data?.reviews?.data || [], [data?.reviews]);
  const similarProducts = useMemo(() => data?.similar?.products || [], [data?.similar]);

  // ── Stock & Pricing Calculations ──
  const stockQty = currentProduct?.stockQuantity ?? 0;
  const outOfStock = stockQty <= 0;
  const lowStock = stockQty > 0 && stockQty <= 5;

  const totalReviews = currentProduct?.totalReviews ?? 0;
   const rawRating = Number(currentProduct?.averageRating);
   const averageRatingValue = (!isNaN(rawRating) ? rawRating : 0).toFixed(1);
  const hasReviews = safeReviewsArray.length > 0;

  const effectiveSubscriptionDiscountPercent = currentProduct?.discountPercentage ?? 0;
  const currentPrice = useMemo(() => {
  if (!currentProduct) return "0.00";
  
  const priceToUse = isSubscribe && currentProduct.finalPrice 
    ? currentProduct.finalPrice 
    : currentProduct.price;

  // String ho ya Number, safely convert ho jayega
  const numericPrice = Number(priceToUse || 0);
  
  return (!isNaN(numericPrice) ? numericPrice : 0).toFixed(2);
}, [currentProduct, isSubscribe]);

  const hasDiscount = Boolean(
    currentProduct?.originalPrice && currentProduct.originalPrice > currentProduct.price
  );
  const discountPercentValue = useMemo(() => {
    if (!currentProduct?.originalPrice || currentProduct.originalPrice <= currentProduct.price) return 0;
    return Math.round(
      ((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100
    );
  }, [currentProduct]);

  // ── Image Processing ──
  const productImages = useMemo(() => {
    if (currentProduct?.images && currentProduct.images.length > 0) {
      return currentProduct.images.map((img) => ({
        src: img.url,
        title: img.title || "",
        description: "",
      }));
    }
    return [{ src: "/placeholder.jpg", title: "", description: "" }];
  }, [currentProduct?.images]);

  const currentImage = productImages[selectedImageIndex] || productImages[0];

  const designHighlightItems = useMemo(() => {
    return productImages
      .filter((img) => img.title.trim().length > 0)
      .slice(0, 5)
      .map((img) => ({
        image: img.src,
        title: img.title,
        description: img.description || "",
      }));
  }, [productImages]);

  // ── Review Stats Computation ──
  const ratingBreakdown = useMemo(() => {
    const stars = [5, 4, 3, 2, 1];
    if (!hasReviews) return stars.map((star) => ({ star, count: 0, percent: 0 }));
    const counts: Record<number, number> = stars.reduce((acc, star) => ({ ...acc, [star]: 0 }), {});
    
    safeReviewsArray.forEach((review) => {
      const normalized = Math.min(Math.max(Math.round(Number(review.rating) || 0), 1), 5);
      counts[normalized] += 1;
    });

    return stars.map((star) => ({
      star,
      count: counts[star],
      percent: Math.round((counts[star] / safeReviewsArray.length) * 100),
    }));
  }, [hasReviews, safeReviewsArray]);

  const positivePercent = useMemo(() => {
    if (!hasReviews) return 0;
    const positiveCount = safeReviewsArray.filter((r) => Number(r.rating) >= 4).length;
    return Math.round((positiveCount / safeReviewsArray.length) * 100);
  }, [hasReviews, safeReviewsArray]);

  const mostCommonStar = useMemo(() => {
    return ratingBreakdown.reduce((best, item) => (item.count > best.count ? item : best), ratingBreakdown[0]).star;
  }, [ratingBreakdown]);

  // ── Specification Formatting ──
  const specEntries = useMemo<[string, any][]>(() => {
    if (
      currentProduct?.specifications &&
      typeof currentProduct.specifications === "object" &&
      !Array.isArray(currentProduct.specifications)
    ) {
      return Object.entries(currentProduct.specifications);
    }
    return [];
  }, [currentProduct?.specifications]);

  // ── Effects ──
  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariant(null);
    setOpenAccordion(null);
    setOpenFaqIndex(null);
    setQuantity(1);
  }, [slug]);

  useEffect(() => {
    if (!currentProduct) return;
    setQuantity((prev) => clampToStock(prev, currentProduct as any));
  }, [currentProduct]);

  useEffect(() => {
    const handleScroll = () => {
      if (productInfoRef.current) {
        setIsSticky(productInfoRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Handlers ──
  const handleAddToCart = useCallback(() => {
    if (!currentProduct) return;

    if (outOfStock) {
      modals.alert({
        title: "Out of Stock",
        description: `"${currentProduct.name}" is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    // Add to cart via custom hook
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: parseFloat(currentPrice),
        deliveryCharges: currentProduct.deliveryCharges || 0,
        image: currentProduct.images?.[0]?.url || "",
        stockQuantity: stockQty,
        specifications: currentProduct.specifications || {},
        isSubscription: isSubscribe,
      } as any);
    }
  }, [currentProduct, outOfStock, quantity, addToCart, currentPrice, stockQty, isSubscribe]);

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  }, [productImages.length]);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  }, [productImages.length]);

  const renderStars = useCallback((rating: number, size: "sm" | "md" = "md") => {
    const cls = size === "sm" ? "text-sm" : "text-base";
    return [1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={`${cls} ${s <= Math.round(rating || 0) ? "text-amber-600" : "text-[#e0d5c5]"}`}
      >
        ★
      </span>
    ));
  }, []);

  // ── Loading & Error States ──
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 py-8">
          {/* <ProductDetailSkeleton /> */}
        </div>
      </div>
    );
  }

  if (isError || !currentProduct) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center px-4 py-20">
          <h1 className="font-playfair text-4xl font-bold text-[#1a1208] mb-4">
            Product Not Found
          </h1>
          <p className="text-[#4a3a28] mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="inline-block px-8 py-3 bg-[#1a1208] text-white rounded-full font-semibold hover:bg-[#8b6240] transition-all hover:-translate-y-0.5"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI Rendering ──
  return (
    <>
    

      <div className="bg-white min-h-screen font-outfit text-[#1a1208]">
        {/* Sticky Top Bar */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 bg-[#1a1208] transform transition-transform duration-500 ${
            isSticky ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center justify-center gap-6 sm:gap-9 py-2.5 px-4 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
              ✓ Free Shipping over $50
            </span>
            <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
              ✓ Subscribe &amp; Save
            </span>
            <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
              ✓ Guaranteed Quality
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-[#e5ddd0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-start">
            <ProductImageGallery
              productImages={productImages as any}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              currentImage={currentImage as any}
              productName={currentProduct.name}
              hasDiscount={hasDiscount}
              discountPercentValue={discountPercentValue}
              handlePrevImage={handlePrevImage}
              handleNextImage={handleNextImage}
              outOfStock={outOfStock}
            />

            <ProductInfoColumn
              productInfoRef={productInfoRef}
              currentProduct={currentProduct as any}
              labels={currentProduct.labels || []}
              heroContent={{ subtitle: "" }}
              normalizedFeatures={currentProduct.features || []}
              variants={[]}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              isSubscribe={isSubscribe}
              setIsSubscribe={setIsSubscribe}
              activeSubscription={null}
              setShowSubscriptionModal={setShowSubscriptionModal}
              effectiveSubscriptionDiscountPercent={effectiveSubscriptionDiscountPercent}
              subscriptionPrice={currentPrice}
              quantity={quantity}
              setQuantity={setQuantity}
              qtyMax={stockQty}
              outOfStock={outOfStock}
              lowStock={lowStock}
              stockQty={stockQty}
              cartUniqueCount={cartUniqueCount}
              currentPrice={currentPrice}
              handleAddToCart={handleAddToCart}
              openAccordion={openAccordion}
              setOpenAccordion={setOpenAccordion}
              ingredients={[]}
              hasDeliveryRule={Boolean(currentProduct.deliveryRule)}
              hasInsuranceDetails={Boolean(currentProduct.insuranceDetails)}
              normalizedFeaturesAll={currentProduct.features || []}
              renderStars={renderStars}
              averageRatingValue={averageRatingValue}
              totalReviews={totalReviews}
              hasReviews={hasReviews}
            />
          </div>
        </section>

        {/* Dynamic Details & Marketing Sections */}
        <LogoSliderSection />
        <HighlightsSection highlights={currentProduct.highlights || []} />
        <DesignHighlightsSection designHighlightItems={designHighlightItems} />
        <SpecificationsSection specEntries={specEntries} />
        
        <PackageContentSection
          nutritionFacts={[]}
          currentProduct={currentProduct as any}
          isNutritionExpanded={isNutritionExpanded}
          setIsNutritionExpanded={setIsNutritionExpanded}
        />

        <UsageSection
          hasUsageInstructions={Boolean(currentProduct.usageInstructions?.trim())}
          usageInstructionsContent={currentProduct.usageInstructions?.split("\n") || []}
        />

        <FaqsSection
          faqs={currentProduct.faqs || []}
          openFaqIndex={openFaqIndex}
          setOpenFaqIndex={setOpenFaqIndex}
        />

        <ReviewsSection
          currentProduct={currentProduct as any}
          averageRatingValue={averageRatingValue}
          totalReviews={totalReviews}
          hasReviews={hasReviews}
          safeReviewsArray={safeReviewsArray as any}
          ratingBreakdown={ratingBreakdown}
          positivePercent={positivePercent}
          mostCommonStar={mostCommonStar}
          renderStars={renderStars}
        />

        <SimilarProductsSection similarProducts={similarProducts as any} />
      </div>
    </>
  );
};

export default ProductDetailPage;