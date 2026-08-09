"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForgotPassword } from "@/app/features/auth/hooks/auth.hooks";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/app/features/auth/schemas/password-reset.schema";
import { Input } from "@/app/components/ui/input";
import { Spinner } from "@/app/components/ui/spinner";

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setSubmittedEmail(data.email);
          setIsSubmitted(true);
        },
      }
    );
  };

  const errorMessage = forgotPasswordMutation.error
    ? (forgotPasswordMutation.error as any)?.response?.data?.message ||
      forgotPasswordMutation.error?.message ||
      "Failed to process request. Please try again."
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f7f4f0] font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e8dfd8] shadow-xl shadow-amber-900/5 p-8 sm:p-10 relative">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4 text-orange-600 shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#423228]">Forgot Password?</h1>
          <p className="text-xs text-[#736257] mt-1.5 leading-relaxed">
            {isSubmitted
              ? "We've sent password reset instructions to your email."
              : "No worries! Enter your registered email address and we'll send you a reset link."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && !isSubmitted && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-orange-50 border border-orange-200 text-orange-800 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success State View */}
        {isSubmitted ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[#faf8f5] border border-[#e8dfd8] text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-xs text-[#423228] font-medium">Reset link sent to:</p>
              <p className="text-xs text-orange-600 font-bold mt-0.5">{submittedEmail}</p>
            </div>

            <p className="text-[11px] text-[#918075] text-center">
              Didn't receive the email? Check your spam folder or click below to try again.
            </p>

            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="w-full h-11 bg-[#faf8f5] border border-[#e8dfd8] text-[#423228] hover:bg-[#f0e8e2] rounded-xl text-xs font-semibold transition-all"
            >
              Resend Link
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs"
              {...register("email")}
              error={errors.email?.message}
              disabled={forgotPasswordMutation.isPending}
            />

            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {forgotPasswordMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-[#f0e8e2] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#736257] hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}