import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Main Warm Orange Theme
        default:
          "bg-amber-600 text-white shadow-md hover:bg-amber-700 active:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500",
        
        // Light Warm Brown / Caramel Accent
        accent:
          "bg-stone-200 text-amber-950 shadow-xs hover:bg-stone-300 active:bg-stone-400 dark:bg-stone-800 dark:text-amber-100 dark:hover:bg-stone-700",
        
        // Secondary Soft Orange Tone
        secondary:
          "bg-amber-100 text-amber-900 hover:bg-amber-200 active:bg-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900/80",

        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-700 dark:hover:bg-rose-600",
        
        outline:
          "border border-stone-300 bg-transparent text-stone-800 shadow-xs hover:bg-amber-50 hover:border-amber-500 hover:text-amber-700 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-amber-400",
        
        ghost:
          "text-stone-700 hover:bg-amber-100/60 hover:text-amber-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-amber-300",
        
        link: "text-amber-600 underline-offset-4 hover:underline dark:text-amber-400",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-6 text-base has-[>svg]:px-4.5",
        xl: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        "2xl": "h-14 rounded-xl px-10 text-lg has-[>svg]:px-8",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin size-4 text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };