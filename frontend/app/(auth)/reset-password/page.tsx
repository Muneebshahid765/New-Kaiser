"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  useResetPassword,
  useVerifyResetToken,
} from "@/app/features/auth/hooks/auth.hooks";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/app/features/auth/schemas/password-reset.schema";
import { Input } from "@/app/components/ui/input";
import { Spinner } from "@/app/components/ui/spinner";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || undefined;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Token Validation Query
  const { data: tokenStatus, isLoading: isVerifyingToken, isError: isTokenInvalid } =
    useVerifyResetToken(token);

  // Reset Password Mutation
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Token query validation load hona ya URL par missing hone ki condition handle karein
  if (!token || isTokenInvalid || (tokenStatus && !tokenStatus.valid)) {
    if (isVerifyingToken) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0]">
          <Spinner className="size-8 text-orange-600" />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f4f0] font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#e8dfd8] p-8 text-center shadow-xl shadow-amber-900/5">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#423228]">Invalid or Expired Link</h1>
          <p className="text-xs text-[#736257] mt-2 mb-6">
            This password reset link is invalid or has already expired. Please request a new link.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full h-11 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(
      {
        token: token!,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  const errorMessage = resetPasswordMutation.error
    ? (resetPasswordMutation.error as any)?.response?.data?.message ||
      resetPasswordMutation.error?.message ||
      "Failed to reset password"
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f7f4f0] font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e8dfd8] shadow-xl shadow-amber-900/5 p-8 sm:p-10 relative">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4 text-orange-600 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#423228]">Set New Password</h1>
          <p className="text-xs text-[#736257] mt-1.5 leading-relaxed">
            Please enter your new password below.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-orange-50 border border-orange-200 text-orange-800 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success View */}
        {isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
              <h2 className="text-base font-bold text-[#423228]">Password Reset Complete!</h2>
              <p className="text-xs text-[#736257] mt-1">
                Your password has been changed successfully. You can now login with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Reset Password Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("token")} value={token} />

            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs pr-9"
                {...register("newPassword")}
                error={errors.newPassword?.message}
                disabled={resetPasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-[#918075] hover:text-[#594233]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs pr-9"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                disabled={resetPasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 bottom-2.5 text-[#918075] hover:text-[#594233]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full h-11 mt-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {resetPasswordMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  Update Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0] text-[#423228]">
          <Spinner className="size-8 text-orange-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}