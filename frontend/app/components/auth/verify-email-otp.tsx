"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import {
  useVerifyEmail,
  useResendVerificationCode,
} from "@/app/features/auth/hooks/auth.hooks";
import {
  verifyEmailSchema,
  VerifyEmailFormData,
} from "@/app/features/auth/schemas/verify-email.schema";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/app/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/components/ui/input-otp";
import { Spinner } from "@/app/components/ui/spinner";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const verifyOtpMutation = useVerifyEmail();
  const resendOtpMutation = useResendVerificationCode();

  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // 🔄 Page load par AUTO-TIMER start karna + Refresh persistent expiry
  useEffect(() => {
    if (!email) return;

    const STORAGE_KEY = `otp_expiry_${email}`;
    let savedExpiry = localStorage.getItem(STORAGE_KEY);

    // Agar first time visit hai to auto 60 seconds ka expiry time set kardo
    if (!savedExpiry) {
      const initialExpiry = Date.now() + 60 * 1000;
      localStorage.setItem(STORAGE_KEY, initialExpiry.toString());
      savedExpiry = initialExpiry.toString();
    }

    const calcRemaining = () => {
      const remainingSeconds = Math.ceil((parseInt(savedExpiry!, 10) - Date.now()) / 1000);
      if (remainingSeconds > 0) {
        setResendCooldown(remainingSeconds);
      } else {
        setResendCooldown(0);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    calcRemaining();

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(STORAGE_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  const onFormSubmit = (data: VerifyEmailFormData) => {
    if (!data.email || data.code.length !== 6) return;

    verifyOtpMutation.mutate(
      { email: data.email, code: data.code },
      {
        onSuccess: (res) => {
          localStorage.removeItem(`otp_expiry_${email}`);
          const successMsg = res?.message || "Account verified successfully.";
          router.push(`/login?message=${encodeURIComponent(successMsg)}`);
        },
      }
    );
  };

  const handleResend = () => {
    if (!email || resendCooldown > 0) return;

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          const expiryTime = Date.now() + 60 * 1000;
          localStorage.setItem(`otp_expiry_${email}`, expiryTime.toString());
          setResendCooldown(60);
        },
      }
    );
  };

  const errorMessage = verifyOtpMutation.error
    ? (verifyOtpMutation.error as any)?.response?.data?.message ||
      verifyOtpMutation.error?.message ||
      "Verification failed"
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f7f4f0] font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e8dfd8] shadow-xl shadow-amber-900/5 p-8 sm:p-10 relative">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4 text-orange-600 shadow-sm">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#423228]">Verify Your Email</h1>
          <p className="text-xs text-[#736257] mt-1.5 leading-relaxed">
            We've sent a 6-digit verification code to <br />
            <span className="text-orange-600 font-semibold">{email || "your email"}</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-orange-50 border border-orange-200 text-orange-800 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OTP Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center">
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        if (val.length === 6) {
                          form.handleSubmit(onFormSubmit)();
                        }
                      }}
                      disabled={verifyOtpMutation.isPending}
                    >
                      <InputOTPGroup className="gap-2 sm:gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-10 h-12 sm:w-11 sm:h-13 bg-[#faf8f5] border-[#e8dfd8] rounded-xl text-lg font-bold text-[#3b2d24] transition-all data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-inner"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500 mt-2" />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={verifyOtpMutation.isPending || form.watch("code")?.length !== 6}
              className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {verifyOtpMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  Verify Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </Form>

        {/* Resend OTP Section */}
        <div className="mt-8 pt-6 border-t border-[#f0e8e2] flex flex-col items-center gap-2 text-xs text-[#736257]">
          <p>Didn't receive the OTP code?</p>

          {resendOtpMutation.isSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{resendOtpMutation.data?.message || "Code resent successfully!"}</span>
            </div>
          )}

          {resendOtpMutation.isError && (
            <p className="text-rose-500 text-xs">Failed to resend code. Try again.</p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resendOtpMutation.isPending || resendCooldown > 0}
            className={`inline-flex items-center gap-1.5 font-semibold transition-all mt-1 ${
              resendCooldown > 0 || resendOtpMutation.isPending
                ? "text-gray-400 opacity-60 cursor-not-allowed no-underline"
                : "text-orange-600 hover:underline cursor-pointer"
            }`}
          >
            {resendOtpMutation.isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0] text-[#423228]">
          <Spinner className="size-8 text-orange-600" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}