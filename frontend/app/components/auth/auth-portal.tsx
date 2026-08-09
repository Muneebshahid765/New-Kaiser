"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Award,
  Truck,
  Users,
} from "lucide-react";
import {
  useLogin as useBuyerLogin,
  useRegister,
} from "@/app/features/auth/hooks/auth.hooks";
import {
  loginSchema,
  LoginFormData,
} from "@/app/features/auth/schemas/login.schemas";
import {
  registerSchema,
  RegisterFormData,
} from "@/app/features/auth/schemas/register.schema";
import { Input } from "@/app/components/ui/input";
import { Spinner } from "@/app/components/ui/spinner";

export function AuthPortal() {
  const router = useRouter();

  const buyerLoginMutation = useBuyerLogin();
  const registerBuyerMutation = useRegister();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSignupMode, setIsSignupMode] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  // Sign In state
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  // Register state
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Simple Password Strength Calculator
  const watchedPassword = registerForm.watch("password") || "";
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-gray-200" };
    if (pass.length < 6) return { score: 33, label: "Weak", color: "bg-rose-500", textColor: "text-rose-500" };
    if (pass.length < 10 || !/[0-9]/.test(pass)) return { score: 66, label: "Medium", color: "bg-amber-500", textColor: "text-amber-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
  };
  const strength = getPasswordStrength(watchedPassword);

  const onLoginSubmit = (data: LoginFormData) => {
    setActiveError(null);

    buyerLoginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (err: any) => {
          const status = err?.response?.status;
          const message = err?.response?.data?.message || err?.message || "";

          if (status === 403 || message.toLowerCase().includes("verify")) {
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
            return;
          }

          setActiveError(message || "Invalid credentials. Please try again.");
        },
      }
    );
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    if (!agreeTerms) {
      setActiveError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }
    setActiveError(null);

    registerBuyerMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (res: any) => {
          registerForm.reset();
          const email = res?.buyer?.email || data.email;
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "Registration failed";
          setActiveError(msg);
        },
      }
    );
  };

  const toggleMode = () => {
    setIsSignupMode((prev) => !prev);
    loginForm.reset();
    registerForm.reset();
    setActiveError(null);
  };

  const activeLoading = buyerLoginMutation.isPending || registerBuyerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f7f4f0] font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#e8dfd8] shadow-xl shadow-amber-900/5 overflow-hidden grid lg:grid-cols-2">
        
        {/* Left Side Panel: Branding, Illustration & Feature Grid */}
        <div className="bg-gradient-to-br from-[#8c6d58] via-[#735745] to-[#594233] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Header Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest bg-orange-500/20 text-orange-200 border border-orange-400/30 px-3 py-1 rounded-full mb-3">
              BUYER PORTAL
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-amber-50">Africa Kaiser</h2>
            <p className="text-xs text-amber-200/80 mt-0.5">Quality Building & Electrical Materials</p>
          </div>

          {/* Original SVG Illustration */}
          <div className="my-4 relative z-10 flex items-center justify-center">
            <svg
              className="w-full max-w-[240px] h-auto text-amber-100/90 drop-shadow-md"
              viewBox="0 0 300 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="20" y="30" width="260" height="170" rx="12" fill="#ffffff" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" />
              <rect x="20" y="30" width="260" height="30" rx="12" fill="#ffffff" fillOpacity="0.12" />
              <circle cx="36" cy="45" r="4" fill="#f97316" />
              <circle cx="48" cy="45" r="4" fill="#fbbf24" />
              <circle cx="60" cy="45" r="4" fill="#34d399" />

              <path
                d="M150 75 L185 90 V125 C185 150 150 165 150 165 C150 165 115 150 115 125 V90 L150 75 Z"
                fill="#ea580c"
                fillOpacity="0.8"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path d="M142 120 L148 126 L158 114" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              <rect x="40" y="80" width="60" height="40" rx="6" fill="#ffffff" fillOpacity="0.15" />
              <rect x="48" y="105" width="30" height="4" rx="2" fill="#ffffff" fillOpacity="0.6" />
              <rect x="200" y="80" width="60" height="70" rx="6" fill="#ffffff" fillOpacity="0.15" />
              <rect x="210" y="120" width="12" height="20" rx="2" fill="#f97316" />
              <rect x="228" y="100" width="12" height="40" rx="2" fill="#ffffff" fillOpacity="0.8" />

              <line x1="100" y1="100" x2="115" y2="100" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="185" y1="115" x2="200" y2="115" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-3 relative z-10 mb-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-50">Secure & Encrypted</h4>
                <p className="text-[10px] text-amber-200/70 leading-tight">Your data is safe with end-to-end encryption.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Award className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-50">Quality Products</h4>
                <p className="text-[10px] text-amber-200/70 leading-tight">We provide premium building materials.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Truck className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-50">Fast Delivery</h4>
                <p className="text-[10px] text-amber-200/70 leading-tight">Reliable and on-time delivery across regions.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Users className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-50">Trusted by Experts</h4>
                <p className="text-[10px] text-amber-200/70 leading-tight">Builders & contractors trust Africa Kaiser.</p>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-amber-200/90 bg-black/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-[11px]">End-to-end encrypted authentication</span>
          </div>
        </div>

        {/* Right Side Panel: Form Container */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-white min-h-[540px]">
          <div>
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-[#423228]">
                {isSignupMode ? "Create Account" : "Sign In"}
              </h1>
              <p className="text-xs text-[#736257] mt-1">
                {isSignupMode
                  ? "Create your account to enjoy a faster and easier shopping experience."
                  : "Welcome back! Please sign in to your account."}
              </p>
            </div>

            {activeError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs bg-orange-50 border border-orange-200 text-orange-800 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
                <span>{activeError}</span>
              </div>
            )}

            {isSignupMode ? (
              /* REGISTER FORM */
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="FIRST NAME"
                    placeholder="John"
                    className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs"
                    {...registerForm.register("firstName")}
                    error={registerForm.formState.errors.firstName?.message}
                    disabled={activeLoading}
                  />
                  <Input
                    label="LAST NAME"
                    placeholder="Doe"
                    className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs"
                    {...registerForm.register("lastName")}
                    error={registerForm.formState.errors.lastName?.message}
                    disabled={activeLoading}
                  />
                </div>

                <Input
                  label="EMAIL ADDRESS"
                  type="email"
                  placeholder="user@example.com"
                  className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs"
                  {...registerForm.register("email")}
                  error={registerForm.formState.errors.email?.message}
                  disabled={activeLoading}
                />
       <div className="grid grid-cols-2 gap-3">
  {/* PASSWORD FIELD */}
  <div className="space-y-1">
    <div className="relative flex items-center">
      <Input
        label="PASSWORD"
        type={showPassword ? "text" : "password"}
        placeholder="Create password"
        className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs pr-9 w-full"
        {...registerForm.register("password")}
        disabled={activeLoading}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2.5 top-[43px] -translate-y-1/2 text-[#918075] hover:text-[#594233] z-10"
      >
        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
    {registerForm.formState.errors.password && (
      <p className="text-[11px] text-rose-500 whitespace-nowrap truncate mt-1">
        {registerForm.formState.errors.password.message}
      </p>
    )}
  </div>

  {/* CONFIRM PASSWORD FIELD */}
  <div className="space-y-1">
    <div className="relative flex items-center">
      <Input
        label="CONFIRM PASSWORD"
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm password"
        className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs pr-9 w-full"
        {...registerForm.register("confirmPassword")}
        disabled={activeLoading}
      />
      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-2.5 top-[43px] -translate-y-1/2 text-[#918075] hover:text-[#594233] z-10"
      >
        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
    {registerForm.formState.errors.confirmPassword && (
      <p className="text-[11px] text-rose-500 whitespace-nowrap truncate mt-1">
        {registerForm.formState.errors.confirmPassword.message}
      </p>
    )}
  </div>
</div>

                {/* Password Strength Indicator */}
                {watchedPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#736257]">Password strength:</span>
                      <span className={`font-semibold ${strength.textColor}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Terms and Privacy Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer border-[#e8dfd8]"
                  />
                  <label htmlFor="terms" className="text-xs text-[#736257] cursor-pointer">
                    I agree to the{" "}
                    <span className="text-orange-600 font-medium hover:underline">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-orange-600 font-medium hover:underline">Privacy Policy</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={activeLoading}
                  className="w-full h-11 mt-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {activeLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGN IN FORM */
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-7 pt-5">
                <Input
                  label="EMAIL ADDRESS"
                  type="email"
                  placeholder="user@example.com"
                  className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs"
                  {...loginForm.register("email")}
                  error={loginForm.formState.errors.email?.message}
                  disabled={activeLoading}
                />

              <div className="space-y-1">
  {/* Input Wrapper for Input + Eye Icon */}
  <div className="relative flex items-center">
    <Input
      label="PASSWORD"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      className="bg-[#faf8f5] border-[#e8dfd8] text-[#3b2d24] focus:border-orange-500 text-xs pr-10 w-full"
      {...loginForm.register("password")}
      disabled={activeLoading}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-[43px] -translate-y-1/2 text-[#918075] hover:text-[#594233] z-10"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
  
  {/* Error Message: Single Line Strict */}
  {loginForm.formState.errors.password && (
    <p className="text-[11px] text-rose-500 whitespace-nowrap truncate mt-1">
      {loginForm.formState.errors.password.message}
    </p>
  )}
</div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#736257]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-orange-600 rounded border-[#e8dfd8]"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs text-orange-600 font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={activeLoading}
                  className="w-full h-11 mt-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {activeLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Switcher Bar */}
          <div className="mt-6 pt-4 border-t border-[#f0e8e2] text-center text-xs text-[#736257]">
            <span>{isSignupMode ? "Already have an account?" : "Don't have an account?"}</span>{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-orange-600 font-semibold hover:underline ml-1 cursor-pointer"
            >
              {isSignupMode ? "Sign In" : "Register now"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}