"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  unstyled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error,
      label,
      helperText,
      leftIcon,
      rightIcon,
      id,
      unstyled = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    if (unstyled) {
      return (
        <input
          type={type}
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={className}
          {...props}
        />
      );
    }

    return (
      <div className="w-full text-left space-y-1.5">
        {label && (
          <Label htmlFor={inputId} className="text-stone-700 dark:text-stone-300 font-medium">
            {label}
          </Label>
        )}
        
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-stone-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-10 px-3 py-2 text-sm rounded-lg border transition-all duration-150 outline-none",
              "bg-stone-50 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100",
              "border-stone-300 dark:border-stone-800",
              "placeholder:text-stone-400 dark:placeholder:text-stone-500",
              // Warm Amber/Orange Focus Styles
              "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-100 dark:disabled:bg-stone-900",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-stone-400 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-stone-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };