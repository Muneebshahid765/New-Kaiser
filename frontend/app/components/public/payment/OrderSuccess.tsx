"use client";

import React, { useEffect } from "react";
import { Check, Printer, Mail } from "lucide-react";
import type { VerifiedPaymentOrder } from "@/app/features/checkout/types/checkout-response.types";

interface OrderSuccessProps {
  order: VerifiedPaymentOrder | null;
  onNewCheckout?: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, onNewCheckout }) => {
  useEffect(() => {
    if (order) {
      localStorage.setItem("lastOrder", JSON.stringify(order));
    }
  }, [order]);

  useEffect(() => {
    sessionStorage.setItem("onReceiptPage", "true");
    const handleBeforeUnload = () => {
      sessionStorage.setItem("pageUnloading", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      const isPageUnloading = sessionStorage.getItem("pageUnloading") === "true";
      if (!isPageUnloading) {
        localStorage.removeItem("lastOrder");
      }
      sessionStorage.removeItem("onReceiptPage");
      sessionStorage.removeItem("pageUnloading");
    };
  }, []);

  const getStatusText = (status?: string): string => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "paid":
        return "Paid";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      default:
        return status || "Confirmed";
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center p-8">
        <div className="bg-white border border-[#E8D9C8] rounded-lg p-12 max-w-md w-full text-center shadow-[0_8px_32px_rgba(122,92,68,0.1)]">
          <div className="w-16 h-16 rounded-full bg-[#FBF5EF] border border-[#E8D9C8] flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A0856C" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-serif text-[#2C1F14] mb-3">Order not found</h2>
          <p className="text-sm text-[#8C7260] leading-relaxed mb-6">
            Unable to load order details. Please check your email for confirmation.
          </p>
          <button
            onClick={() => (window.location.href = "/products")}
            className="px-6 py-3 bg-[#7A5C44] text-[#FBF5EF] rounded font-medium hover:bg-[#6A4C38] transition-colors cursor-pointer"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex flex-col items-center justify-center p-6 sm:p-8 relative font-serif">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#7A5C44]" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4B896]" />

      <div className="bg-white border border-[#E8D9C8] rounded max-w-[520px] w-full p-8 sm:p-12 relative shadow-[0_8px_32px_rgba(122,92,68,0.1),0_24px_64px_rgba(122,92,68,0.07)] animate-[fadeUp_0.5s_ease-out_both]">
        <div className="absolute -top-px left-6 right-6 h-px bg-[repeating-linear-gradient(to_right,#C4A882_0px,#C4A882_6px,transparent_6px,transparent_12px)]" />

        <div className="text-center mb-10">
          <div className="w-[72px] h-[72px] rounded-full bg-[#FBF5EF] border-[1.5px] border-[#D4B896] flex items-center justify-center mx-auto mb-6 animate-[popIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both]">
            <Check size={40} className="text-[#7A5C44] animate-[drawCheck_0.35s_ease-out_0.85s_forwards]" />
          </div>
          <h1 className="text-2xl sm:text-[1.65rem] font-normal text-[#2C1F14] tracking-[-0.01em] m-0 mb-2 animate-[fadeUp_0.4s_ease-out_0.4s_both]">
            Payment successful
          </h1>
          <p className="text-sm text-[#8C7260] leading-relaxed m-0 font-sans animate-[fadeUp_0.4s_ease-out_0.5s_both]">
            Your order has been confirmed and will be processed shortly.
          </p>
        </div>

        <div className="bg-[#FBF5EF] border border-[#E8D9C8] rounded p-4 flex items-center justify-between mb-8 animate-[fadeUp_0.4s_ease-out_0.55s_both]">
          <span className="text-xs uppercase tracking-[0.08em] text-[#8C7260] font-sans">
            Order number
          </span>
          <span className="text-sm text-[#2C1F14] font-mono font-bold tracking-[0.04em]">
            {order.orderNumber}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 animate-[fadeUp_0.4s_ease-out_0.6s_both]">
          <div className="flex flex-col gap-1">
            <span className="text-[0.72rem] uppercase tracking-[0.07em] text-[#A08070] font-sans">
              Customer
            </span>
            <span className="text-sm text-[#2C1F14] font-medium font-sans">
              {order.customerName}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.72rem] uppercase tracking-[0.07em] text-[#A08070] font-sans">
              Email
            </span>
            <span className="text-sm text-[#2C1F14] font-medium font-sans break-words">
              {order.customerEmail}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.72rem] uppercase tracking-[0.07em] text-[#A08070] font-sans">
              Amount paid
            </span>
            <span className="text-xl text-[#2C1F14] font-serif tracking-[-0.01em]">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.72rem] uppercase tracking-[0.07em] text-[#A08070] font-sans">
              Status
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[#4A6741] font-medium font-sans bg-[#EDF3EA] border border-[#B8D4AF] rounded-full px-2.5 py-1 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A8C3F] flex-shrink-0" />
              {getStatusText(order.orderStatus || order.paymentStatus)}
            </span>
          </div>
        </div>

        <div className="h-px bg-[repeating-linear-gradient(to_right,#D4B896_0px,#D4B896_6px,transparent_6px,transparent_12px)] mb-6 animate-[fadeUp_0.4s_ease-out_0.65s_both]" />

        <div className="flex items-start gap-2.5 text-sm text-[#8C7260] font-sans leading-relaxed mb-8 animate-[fadeUp_0.4s_ease-out_0.7s_both]">
          <Mail size={16} className="flex-shrink-0 mt-0.5" />
          <p className="m-0">
            A receipt has been sent to <strong className="text-[#2C1F14] font-medium">{order.customerEmail}</strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-[fadeUp_0.4s_ease-out_0.75s_both]">
          <button
            onClick={() => {
              localStorage.removeItem("lastOrder");
              if (onNewCheckout) onNewCheckout();
              window.location.href = "/products";
            }}
            className="flex-1 py-3.5 px-5 bg-[#7A5C44] text-[#FBF5EF] rounded font-medium text-sm font-sans tracking-[0.02em] border-none cursor-pointer transition-all hover:bg-[#6A4C38] hover:-translate-y-0.5 active:translate-y-0"
          >
            Continue shopping
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 py-3.5 px-5 bg-transparent text-[#7A5C44] border border-[#C4A882] rounded font-medium text-sm font-sans tracking-[0.02em] cursor-pointer transition-all hover:bg-[#FBF5EF] hover:border-[#A08070] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Printer size={15} />
            Print receipt
          </button>
        </div>

        <p className="text-center text-xs text-[#B09880] font-sans m-0 animate-[fadeUp_0.4s_ease-out_0.8s_both]">
          Questions? Contact our support team anytime.
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes popIn {
          from {
            transform: scale(0.6);
            opacity: 0;
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes drawCheck {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .min-h-screen,
          .bg-white {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;