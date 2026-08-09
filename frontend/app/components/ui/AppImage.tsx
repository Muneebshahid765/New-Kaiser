"use client";

import React, { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { CameraIcon } from "lucide-react";

const BACKEND_URL = "http://localhost:3000";

// Zero-network Data-URI SVG fallback
const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'/%3E%3Ccircle cx='12' cy='13' r='3'/%3E%3C/svg%3E`;

function resolveImageUrl(url?: string | null): string | null {
  if (!url || url.trim() === "" || url === "null" || url === "undefined") return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

interface AppImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: string | null;
  className?: string;
  iconSize?: number;
}

export const AppImage: React.FC<AppImageProps> = ({
  src,
  alt,
  className = "",
  iconSize = 18,
  ...props
}) => {
  const initialUrl = resolveImageUrl(src);
  const [imgSrc, setImgSrc] = useState<string | null>(initialUrl);
  const [hasError, setHasError] = useState(false);

  // Jab image na ho ya fail ho jaye -> Direct Camera Icon Render Karo
  if (!imgSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-100 border border-stone-200/80 text-stone-400 shrink-0 ${className}`}
        style={{ width: props.width, height: props.height }}
      >
        <CameraIcon size={iconSize} />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Image"}
      unoptimized
      className={`object-cover ${className}`}
      onError={() => {
        // Fallback to SVG Data URI immediately without firing 404 network request
        setImgSrc(FALLBACK_SVG);
        setHasError(true);
      }}
    />
  );
};

// ─────────────────────────────────────────────
// ProductThumb — Standard Table Row Image
// ─────────────────────────────────────────────
interface ProductThumbProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export const ProductThumb: React.FC<ProductThumbProps> = ({
  src,
  alt,
  size = 44,
  className = "",
}) => (
  <AppImage
    src={src}
    alt={alt}
    width={size}
    height={size}
    iconSize={Math.round(size * 0.4)}
    className={`rounded-xl border border-stone-200/80 bg-stone-50 ${className}`}
  />
);