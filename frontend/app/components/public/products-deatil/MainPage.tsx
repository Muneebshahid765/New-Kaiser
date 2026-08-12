"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProductById,
  fetchSimilarProducts,
} from "@/state/redux/fetchProduct";
import { fetchProductReviews } from "@/state/redux/productReviewSlice";
import { fetchMySubscription } from "@/state/redux/subscriptionsSlice";
import SEO from "@/components/SEO";
import { ProductDetailSkeleton } from "@/components/SkeletonLoader";
import CartLimitModal from "@/components/CartLimitModal";
import SubscriptionModal from "@/components/SubscriptionModal";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductInfoColumn } from "@/components/product/ProductInfoColumn";
import { LogoSliderSection } from "@/components/product/LogoSliderSection";
import { HighlightsSection } from "@/components/product/HighlightsSection";
import { DesignHighlightsSection } from "@/components/product/DesignHighlightsSection";
import { SpecificationsSection } from "@/components/product/SpecificationsSection";
import { NutritionSection } from "@/components/product/NutritionSection";
import { UsageSection } from "@/components/product/UsageSection";
import { FaqsSection } from "@/components/product/FaqsSection";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { SimilarProductsSection } from "@/components/product/SimilarProductsSection";
import { isOutOfStock, isLowStock, clampToStock, addableQty } from "@/utils/stockUtils";
import type { RootState } from "@/state/store";
import type { Product, CartItem } from "@/types/product";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch();

  // ── Redux State ──
  const { currentProduct, loading, similarProducts } = useSelector(
    (state: RootState) => state.fetch
  );
  const { reviews, reviewStats } = useSelector(
    (state: RootState) => state.productReview
  );
  const { isAuthenticated: isBuyerAuthenticated } = useSelector(
    (state: RootState) => state.buyerAuth
  );
  const { activeSubscription } = useSelector(
    (state: RootState) => state.subscription
  );

  // ── Refs ──
  const productInfoRef = useRef<HTMLDivElement>(null);
  const lastFetchedId = useRef<string | null>(null);
  const subscriptionFetchedRef = useRef(false);

  // ── State ──
  const [quantity, setQuantity] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isNutritionExpanded, setIsNutritionExpanded] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [cartUniqueCount, setCartUniqueCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning" as "warning" | "success" | "error" | "info",
  });

  // ── Derived ──
  const outOfStock = isOutOfStock(currentProduct);
  const lowStock = isLowStock(currentProduct);
  const stockQty = currentProduct?.stockQuantity ?? 0;
  const canAddMore = currentProduct ? addableQty(cartItems, currentProduct) : 0;
  const qtyMax = Math.min(canAddMore, 30);

  const safeReviewsArray = reviews || [];
  const totalReviews = reviewStats?.totalReviews ?? currentProduct?.totalReviews ?? 0;
  const averageRatingValue = (
    reviewStats?.averageRating ?? currentProduct?.averageRating ?? 0
  ).toFixed(1);
  const hasReviews = safeReviewsArray.length > 0;

  const highlights = currentProduct?.highlights || [];
  const imageShowcaseItems = (currentProduct?.images || []).map((img: any) => ({
    image: img.url,
    title: img.title || "",
    description: img.description || "",
  }));

  const imageShowcaseDeduped = useMemo(() => {
    const seenKeys = new Set();
    return imageShowcaseItems.reduce((acc: any[], item: any = {}) => {
      const key = [
        (item.title || "").trim().toLowerCase(),
        (item.description || "").trim().toLowerCase(),
        typeof item.image === "string" ? item.image.trim() : JSON.stringify(item.image || {}),
      ].join("|");
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        acc.push(item);
      }
      return acc;
    }, []);
  }, [imageShowcaseItems]);

  const ratingBreakdown = useMemo(() => {
    const stars = [5, 4, 3, 2, 1];
    if (!hasReviews) return stars.map((star) => ({ star, count: 0, percent: 0 }));
    const counts: Record<number, number> = stars.reduce((acc, star) => ({ ...acc, [star]: 0 }), {});
    safeReviewsArray.forEach((review: any) => {
      const normalized = Math.min(Math.max(Math.round(Number(review.rating) || 0), 1), 5);
      counts[normalized] += 1;
    });
    return stars.map((star) => ({
      star,
      count: counts[star],
      percent: Math.round((counts[star] / safeReviewsArray.length) * 100),
    }));
  }, [hasReviews, safeReviewsArray]);

  const positivePercent = hasReviews
    ? Math.round(
        (safeReviewsArray.filter((r: any) => Number(r.rating) >= 4).length /
          safeReviewsArray.length) *
          100
      )
    : 0;

  const mostCommonStar = ratingBreakdown.reduce(
    (best, item) => (item.count > best.count ? item : best),
    ratingBreakdown[0] || { star: 5 }
  ).star;

  const effectiveSubscriptionDiscountPercent = useMemo(() => {
    if (activeSubscription?.isValid && activeSubscription?.plan?.discountPercent) {
      return Math.min(Math.max(Number(activeSubscription.plan.discountPercent) || 0, 0), 90);
    }
    return 0;
  }, [activeSubscription]);

  // ── Effects ──
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id)).then((action: any) => {
        const productId = action.payload?._id || action.payload?.product?._id;
        if (productId) dispatch(fetchProductReviews(productId));
      });
      setSelectedImageIndex(0);
      setSelectedVariant(null);
      setOpenAccordion(null);
      setOpenFaqIndex(null);
      setQuantity(1);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (subscriptionFetchedRef.current) return;
    subscriptionFetchedRef.current = true;
    if (isBuyerAuthenticated) {
      dispatch(fetchMySubscription());
    }
  }, [dispatch, isBuyerAuthenticated]);

  useEffect(() => {
    if (activeSubscription?.isValid) setIsSubscribe(true);
  }, [activeSubscription]);

  useEffect(() => {
    const syncCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
      setCartUniqueCount(cart.length);
    };
    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, []);

  useEffect(() => {
    if (!currentProduct) return;
    setQuantity((prev) => clampToStock(prev, currentProduct));
  }, [currentProduct?.stockQuantity]);

  useEffect(() => {
    const handleScroll = () => {
      if (productInfoRef.current) {
        setIsSticky(productInfoRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const pid = currentProduct?._id;
    if (!pid || lastFetchedId.current === pid) return;
    lastFetchedId.current = pid;
    dispatch(
      fetchSimilarProducts({
        productId: pid,
        category: currentProduct?.category?._id ||
          currentProduct?.category?.slug ||
          currentProduct?.category,
      })
    );
  }, [dispatch, currentProduct?._id, currentProduct?.category]);

  useEffect(() => {
    if (currentProduct?.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(currentProduct.variants[0]);
    }
  }, [currentProduct?.variants, selectedVariant]);

  // ── Handlers ──
  const showModal = useCallback(
    (title: string, message: string, type: "warning" | "success" | "error" | "info" = "warning") => {
      setModalState({ isOpen: true, title, message, type });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (outOfStock) {
      showModal(
        "Out of Stock",
        `"${currentProduct.name}" is currently out of stock. Please check back later.`,
        "warning"
      );
      return;
    }

    const MAX_UNIQUE_PRODUCTS = 30;
    const MAX_PER_PRODUCT = 30;
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = existingCart.findIndex(
      (item: any) => item.id === currentProduct._id
    );
    const isNewProduct = existingIndex === -1;

    if (isNewProduct && existingCart.length >= MAX_UNIQUE_PRODUCTS) {
      showModal(
        "Cart Limit Reached",
        `You already have ${existingCart.length} different products in your cart. Maximum allowed is ${MAX_UNIQUE_PRODUCTS} products.`,
        "warning"
      );
      return;
    }

    const currentCartQty = existingIndex >= 0 ? existingCart[existingIndex].quantity : 0;
    const newTotal = currentCartQty + quantity;

    if (newTotal > stockQty) {
      const canAdd = stockQty - currentCartQty;
      if (canAdd <= 0) {
        showModal(
          "Stock Limit Reached",
          `You already have all available stock of "${currentProduct.name}" (${stockQty} unit${stockQty !== 1 ? "s" : ""}) in your cart.`,
          "warning"
        );
      } else {
        showModal(
          "Not Enough Stock",
          `Only ${canAdd} more unit${canAdd !== 1 ? "s" : ""} of "${currentProduct.name}" can be added (${stockQty} total in stock, ${currentCartQty} already in cart).`,
          "warning"
        );
      }
      return;
    }

    if (newTotal > MAX_PER_PRODUCT) {
      showModal(
        "Quantity Limit Reached",
        `You already have ${currentCartQty} of "${currentProduct.name}" in your cart. Maximum ${MAX_PER_PRODUCT} units allowed per product.`,
        "warning"
      );
      return;
    }

    const subscriptionPrice = isSubscribe
      ? currentProduct.price * (1 - effectiveSubscriptionDiscountPercent / 100)
      : currentProduct.price;

    if (existingIndex >= 0) {
      existingCart[existingIndex].quantity = newTotal;
    } else {
      existingCart.push({
        id: currentProduct._id,
        name: currentProduct.name,
        price: subscriptionPrice,
        deliveryCharges: currentProduct.deliveryCharges || 0,
        image: currentProduct?.images?.[0]?.url || "",
        quantity: quantity,
        stockQuantity: stockQty,
        specifications: currentProduct.specifications || {},
        isSubscription: isSubscribe,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  }, [currentProduct, outOfStock, quantity, stockQty, isSubscribe, effectiveSubscriptionDiscountPercent, showModal]);

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  }, []);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  }, []);

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

  // ── Compute Product Data ──
  const subscriptionFactor = 1 - (effectiveSubscriptionDiscountPercent || 0) / 100;
  const subscriptionPriceNumber = currentProduct?.price
    ? Math.max(currentProduct.price * subscriptionFactor, 0)
    : 0;
  const subscriptionPrice = subscriptionPriceNumber.toFixed(2);
  const currentPrice = isSubscribe ? subscriptionPrice : currentProduct?.price?.toFixed(2);
  const hasDiscount =
    currentProduct?.originalPrice &&
    currentProduct.originalPrice > currentProduct.price;
  const discountPercentValue = hasDiscount
    ? Math.round(
        ((currentProduct.originalPrice - currentProduct.price) /
          currentProduct.originalPrice) *
          100
      )
    : 0;

  const productImages =
    currentProduct?.images?.length > 0
      ? currentProduct.images.map((img: any) => ({
          src: img.url,
          title: img.title || "",
          description: img.description || "",
        }))
      : [{ src: "/placeholder.jpg", title: "", description: "" }];

  const currentImage = productImages[selectedImageIndex] || productImages[0];
  const variants = currentProduct?.variants || [];
  const labels = currentProduct?.labels || [];
  const faqs = currentProduct?.faqs || [];
  const ingredients = currentProduct?.ingredients || [];
  const nutritionFacts = currentProduct?.nutritionFacts || [];
  const heroContent = currentProduct?.heroContent || {};
  const hasUsageInstructions = Boolean(currentProduct?.usageInstructions?.trim());
  const hasDeliveryRule = Boolean(currentProduct?.deliveryRule?.trim());
  const hasInsuranceDetails = Boolean(currentProduct?.insuranceDetails?.trim());

  const usageInstructionsContent = hasUsageInstructions
    ? currentProduct.usageInstructions
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean)
    : [];

  const normalizedFeatures = Array.isArray(currentProduct?.features)
    ? currentProduct.features
        .map((f: any) => {
          if (typeof f === "string") return f.trim();
          if (typeof f === "object") return f.text || f.title || f.value || "";
          return "";
        })
        .filter(Boolean)
    : [];

  let specEntries: [string, any][] = [];
  if (
    currentProduct?.specifications &&
    typeof currentProduct.specifications === "object" &&
    !Array.isArray(currentProduct.specifications)
  ) {
    specEntries = Object.entries(currentProduct.specifications);
  }

  const displayImageShowcaseItems = imageShowcaseDeduped.slice(0, 5);
  const designHighlightItems = displayImageShowcaseItems.filter((item: any = {}) => {
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const description = typeof item.description === "string" ? item.description.trim() : "";
    return Boolean(title && description);
  });

  // ── Loading State ──
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 py-8">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (!currentProduct) {
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

  // ── Main Render ──
  return (
    <>
      <SEO
        title={currentProduct?.name || "Product Detail"}
        description={
          currentProduct?.description ||
          "View detailed information about this premium electrical product from Africa Kaiser."
        }
        keywords={`${currentProduct?.name}, electrical product Angola, Africa Kaiser, ${currentProduct?.category?.name || ""}`}
        image={
          currentProduct?.images?.[0]?.url ||
          `${process.env.NEXT_PUBLIC_API_URL}/products/placeholder.png`
        }
        url={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/product/${currentProduct?.slug}`}
        type="product"
      />

      <div className="bg-white min-h-screen font-outfit text-[#1a1208]">
        {/* Sticky Bar */}
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
              ✓ Backed by Science
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-[#e5ddd0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-start">
            {/* Image Gallery */}
            <ProductImageGallery
              productImages={productImages}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              currentImage={currentImage}
              productName={currentProduct.name}
              hasDiscount={hasDiscount}
              discountPercentValue={discountPercentValue}
              handlePrevImage={handlePrevImage}
              handleNextImage={handleNextImage}
              outOfStock={outOfStock}
            />

            {/* Product Info */}
            <ProductInfoColumn
              productInfoRef={productInfoRef}
              currentProduct={currentProduct}
              labels={labels}
              heroContent={heroContent}
              normalizedFeatures={normalizedFeatures}
              variants={variants}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              isSubscribe={isSubscribe}
              setIsSubscribe={setIsSubscribe}
              activeSubscription={activeSubscription}
              setShowSubscriptionModal={setShowSubscriptionModal}
              effectiveSubscriptionDiscountPercent={effectiveSubscriptionDiscountPercent}
              subscriptionPrice={subscriptionPrice}
              quantity={quantity}
              setQuantity={setQuantity}
              qtyMax={qtyMax}
              outOfStock={outOfStock}
              lowStock={lowStock}
              stockQty={stockQty}
              cartUniqueCount={cartUniqueCount}
              currentPrice={currentPrice}
              handleAddToCart={handleAddToCart}
              openAccordion={openAccordion}
              setOpenAccordion={setOpenAccordion}
              ingredients={ingredients}
              hasDeliveryRule={hasDeliveryRule}
              hasInsuranceDetails={hasInsuranceDetails}
              normalizedFeaturesAll={normalizedFeatures}
              renderStars={renderStars}
              averageRatingValue={averageRatingValue}
              totalReviews={totalReviews}
              hasReviews={hasReviews}
            />
          </div>
        </section>

        {/* Logo Slider */}
        <LogoSliderSection />

        {/* Highlights */}
        <HighlightsSection highlights={highlights} />

        {/* Design Highlights */}
        <DesignHighlightsSection
          designHighlightItems={designHighlightItems}
        />

        {/* Specifications */}
        <SpecificationsSection specEntries={specEntries} />

        {/* Nutrition */}
        <NutritionSection
          nutritionFacts={nutritionFacts}
          currentProduct={currentProduct}
          isNutritionExpanded={isNutritionExpanded}
          setIsNutritionExpanded={setIsNutritionExpanded}
        />

        {/* Usage */}
        <UsageSection
          hasUsageInstructions={hasUsageInstructions}
          usageInstructionsContent={usageInstructionsContent}
        />

        {/* FAQs */}
        <FaqsSection
          faqs={faqs}
          openFaqIndex={openFaqIndex}
          setOpenFaqIndex={setOpenFaqIndex}
        />

        {/* Reviews */}
        <ReviewsSection
          currentProduct={currentProduct}
          averageRatingValue={averageRatingValue}
          totalReviews={totalReviews}
          hasReviews={hasReviews}
          safeReviewsArray={safeReviewsArray}
          ratingBreakdown={ratingBreakdown}
          positivePercent={positivePercent}
          mostCommonStar={mostCommonStar}
          renderStars={renderStars}
        />

        {/* Similar Products */}
        <SimilarProductsSection similarProducts={similarProducts} />

        {/* Modals */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          activeSubscription={activeSubscription}
          onSubscriptionChange={() => dispatch(fetchMySubscription())}
        />

        <CartLimitModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
      </div>
    </>
  );
};

export default ProductDetailPage;