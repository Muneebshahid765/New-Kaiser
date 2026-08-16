"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ value = 0, onChange, readOnly = false, size = 20 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const current = hoverRating !== null ? hoverRating : value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(null)}
          className={cn(
            "transition-transform duration-150 focus:outline-none",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors duration-150",
              star <= current
                ? "fill-amber-500 text-amber-500"
                : "fill-transparent text-stone-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}