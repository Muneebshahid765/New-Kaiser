"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/components/ui/input-otp";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TwoFaCodeFieldProps {
  /** Field name in the form — default: "code" */
  name?: string;
  /** Label text above the OTP input */
  label?: string;
  /** Active slot border color variant */
  variant?: "default" | "danger" | "warning";
}

const variantSlotClass: Record<NonNullable<TwoFaCodeFieldProps["variant"]>, string> = {
  default: "focus:border-emerald-500",
  danger:  "focus:border-red-500",
  warning: "focus:border-amber-500",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TwoFaCodeField({
  name = "code",
  label = "Authenticator app ka 6-digit code",
  variant = "default",
}: TwoFaCodeFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col items-center gap-2 w-full">
          {label && (
            <p className="text-xs text-neutral-400 self-start">{label}</p>
          )}
          <FormControl>
            <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={`bg-neutral-900 border-neutral-700 text-neutral-100 ${variantSlotClass[variant]}`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage className="text-xs text-red-400" />
        </FormItem>
      )}
    />
  );
}