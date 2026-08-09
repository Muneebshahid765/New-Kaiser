"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVerifyAdminLoginTwoFactor as useVerifyAdmin2FA } from "@/app/features/admin/hooks/admin-auth.hooks";
import { VerifyTwoFactorLoginSchema } from "@/app/features/admin/schemas/admin-auth.schema";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
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

type VerifyTwoFactorFormData = z.infer<typeof VerifyTwoFactorLoginSchema>;

function Verify2FAContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";
  const tempSessionId = searchParams.get("sessionId") || "";

  const verify2FAMutation = useVerifyAdmin2FA();

  const form = useForm<VerifyTwoFactorFormData>({
    resolver: zodResolver(VerifyTwoFactorLoginSchema),
    defaultValues: {
      email,
      tempSessionId,
      token: "",
    },
  });

  const onFormSubmit = (data: VerifyTwoFactorFormData) => {
    if (data.token.length !== 6 || !tempSessionId || !email) return;

    verify2FAMutation.mutate(
      {
        token: data.token,
        tempSessionId: data.tempSessionId,
        email: data.email,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      }
    );
  };

  const errorMessage = verify2FAMutation.error
    ? (verify2FAMutation.error as any)?.response?.data?.message ||
      verify2FAMutation.error?.message ||
      "Invalid 2FA code"
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🔐</div>
          <CardTitle className="text-2xl text-slate-100">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-slate-400">
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="token"
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
                        disabled={verify2FAMutation.isPending}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="w-10 h-12 bg-slate-950 border-slate-700 text-lg font-bold text-slate-100 data-[active=true]:border-emerald-500"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500 mt-2" />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800 rounded-lg text-center">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  disabled={verify2FAMutation.isPending}
                  className="w-1/2 h-11 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verify2FAMutation.isPending || form.watch("token")?.length !== 6}
                  className="w-1/2 h-11 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verify2FAMutation.isPending ? <Spinner className="size-5" /> : "Verify Code"}
                </button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center justify-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          <p>Lost access? Contact administrator support.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><Spinner className="size-8" /></div>}>
      <Verify2FAContent />
    </Suspense>
  );
}