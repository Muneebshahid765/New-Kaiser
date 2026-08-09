"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Lock } from "lucide-react";
import { useAdminLogin } from "@/app/features/admin/hooks/admin-auth.hooks";
import { loginSchema, LoginFormData } from "@/app/features/auth/schemas/login.schemas";
import { Input } from "@/app/components/ui/input";
import { Spinner } from "@/app/components/ui/spinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const adminLoginMutation = useAdminLogin();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onAdminLoginSubmit = (data: LoginFormData) => {
    setActiveError(null);

    adminLoginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (res: any) => {
          const email = res?.data?.email || res?.email || data.email;
          const sessionId = res?.data?.tempSessionId || res?.tempSessionId;

          // If 2FA is required, navigate directly to page-based /verify-2fa
          if (res?.requiresTwoFactor || res?.data?.requiresTwoFactor || sessionId) {
            router.push(
              `/verify-2fa?email=${encodeURIComponent(email)}&sessionId=${encodeURIComponent(sessionId)}`
            );
            return;
          }

          // Direct login fallback if 2FA is not enabled for admin
          router.push("/dashboard");
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Invalid Admin credentials. Access denied.";
          setActiveError(msg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f7f4f0] font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e8dfd8] shadow-xl shadow-amber-900/5 p-8 sm:p-10 relative">
        
        {/* Top Header & Enterprise Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4 text-amber-600 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-3 py-1 rounded-full mb-2">
            <Lock className="w-3 h-3" /> Secure Console
          </div>
          <h1 className="text-2xl font-bold text-[#423228]">Admin Access</h1>
          <p className="text-xs text-[#736257] mt-1">
            Restricted area. Authorised personnel only.
          </p>
        </div>

        {/* Active Error Alert */}
        {activeError && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-orange-50 border border-orange-200 text-orange-800 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onAdminLoginSubmit)} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@akaisercorp.com"
            className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs"
            {...register("email")}
            error={errors.email?.message}
            disabled={adminLoginMutation.isPending}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs pr-9"
              {...register("password")}
              error={errors.password?.message}
              disabled={adminLoginMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2.5 text-[#918075] hover:text-[#594233]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={adminLoginMutation.isPending}
            className="w-full h-11 mt-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-xs font-semibold hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 disabled:opacity-50"
          >
            {adminLoginMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <>
                Authorize Session <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Security Note */}
        <div className="mt-8 pt-4 border-t border-[#f0e8e2] text-center text-[11px] text-[#918075]">
          Protected by hardware-backed 2FA & IP Monitoring.
        </div>
      </div>
    </div>
  );
}