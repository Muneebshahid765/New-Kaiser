"use client";

import React, { useState, useEffect, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import type { VerifiedPaymentOrder } from "@/app/features/checkout/types/checkout-response.types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function PaymentContent() {
  const router = useRouter();

  const handleSuccess = (order: VerifiedPaymentOrder) => {
    // Verified order response ko save karke receipt page par redirect
    localStorage.setItem("lastOrder", JSON.stringify(order));
    router.push("/order-receipt");
  };

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onSuccess={handleSuccess} />
    </Elements>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#E8D9C8] border-t-[#7A5C44] rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}