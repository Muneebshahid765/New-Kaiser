"use client";

import React from "react";
import { AppImage } from "@/app/components/ui/AppImage";

// Flexible Image Schema that works with both 'url' (API) and 'src' (local)
export interface GalleryImage {
  url?: string;
  src?: string;
  title?: string;
  description?: string;
}

interface ProductImageGalleryProps {
  productImages: GalleryImage[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  currentImage?: GalleryImage;
  productName: string;
  hasDiscount: boolean;
  discountPercentValue: number;
  handlePrevImage: (e: React.MouseEvent) => void;
  handleNextImage: (e: React.MouseEvent) => void;
  outOfStock: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productImages = [],
  selectedImageIndex,
  setSelectedImageIndex,
  currentImage,
  productName,
  hasDiscount,
  discountPercentValue,
  handlePrevImage,
  handleNextImage,
  outOfStock,
}) => {
  const activeImage = currentImage || productImages[selectedImageIndex];
  const activeSrc = activeImage?.url || activeImage?.src || "/placeholder.jpg";

  return (
    <div className="lg:sticky lg:top-8 flex flex-col-reverse lg:flex-row gap-3 animate-[fadeIn_0.5s_ease_both]">
      {/* Thumbnails */}
      {productImages.length > 1 && (
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-thin scrollbar-thumb-[#e0d5c5] scrollbar-track-[#f7f4ef]">
          {productImages.map((img, i) => {
            const imgSrc = img.url || img.src || "/placeholder.jpg";
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImageIndex(i)}
                className={`w-[72px] h-[72px] lg:w-[72px] lg:h-[72px] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === i
                    ? "border-[#8b6240] shadow-[0_0_0_3px_rgba(139,98,64,0.12)]"
                    : "border-[#e5ddd0] hover:border-[#b58a62]"
                }`}
              >
                <AppImage
                  src={imgSrc}
                  alt={`${productName} ${i + 1}`}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                  iconSize={20}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1">
        <div className="relative aspect-[4/5] lg:aspect-[4/5] rounded-2xl overflow-hidden bg-[#f7f4ef] border border-[#e5ddd0] min-h-[300px]">
          <AppImage
            src={activeSrc}
            alt={productName}
            width={800}
            height={1000}
            className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
            iconSize={48}
            priority
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-[#1a1208] text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded z-10">
              Save {discountPercentValue}%
            </div>
          )}

          {/* Out of Stock Overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
              <span className="bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-lg tracking-wide transform -rotate-3 shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Navigation Buttons */}
          {productImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 backdrop-blur-sm text-white text-3xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 hover:bg-[#8b6240] hover:scale-110 z-10"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 backdrop-blur-sm text-white text-3xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 hover:bg-[#8b6240] hover:scale-110 z-10"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {productImages.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {productImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImageIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  selectedImageIndex === i
                    ? "w-5 bg-[#1a1208]"
                    : "bg-[#e0d5c5] hover:bg-[#c8b99a]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Image Caption */}
        {activeImage?.title && (
          <div className="mt-3 text-center">
            <h4 className="text-sm font-semibold text-[#2e2015] font-playfair">
              {activeImage.title}
            </h4>
            {activeImage.description && (
              <p className="text-xs text-[#4a3a28]">{activeImage.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};