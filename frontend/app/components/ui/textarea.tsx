"use client";

import * as React from "react";
import { useDialogComposition } from "@/app/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      error,
      ...props
    },
    ref
  ) => {
    // Get dialog composition context if available
    const dialogComposition = useDialogComposition();

    // IME / CJK Language Composition Handler
    const {
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      onKeyDown: handleKeyDown,
    } = useComposition<HTMLTextAreaElement>({
      onKeyDown: (e) => {
        const isComposing =
          (e.nativeEvent as any).isComposing ||
          dialogComposition?.justEndedComposing?.();

        if (e.key === "Enter" && !e.shiftKey && isComposing) {
          return;
        }

        onKeyDown?.(e);
      },
      onCompositionStart: (e) => {
        dialogComposition?.setComposing?.(true);
        onCompositionStart?.(e);
      },
      onCompositionEnd: (e) => {
        dialogComposition?.markCompositionEnd?.();
        setTimeout(() => {
          dialogComposition?.setComposing?.(false);
        }, 100);
        onCompositionEnd?.(e);
      },
    });

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          // Base Layout & Sizing
          "flex min-h-20 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-150 outline-none",
          // Warm Stone/Amber Theme Matching Input & Button
          "bg-stone-50 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100",
          "border-stone-300 dark:border-stone-800",
          "placeholder:text-stone-400 dark:placeholder:text-stone-500",
          // Focus Styles (Warm Amber Glow)
          "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-900",
          // Error State
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };