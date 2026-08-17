"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Truck } from "lucide-react";
import { CartItem } from "./types/cart";

interface CheckoutSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryCharges: number;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cartItems,
  subtotal,
  tax,
  total,
  deliveryCharges,
}) => {
  const router = useRouter();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayment = (): void => {
    sessionStorage.setItem("newCheckout", "true");
    router.push("/payment");
  };

  return (
    <div className="bg-[#FEFDFB] rounded-2xl shadow-lg overflow-hidden sticky top-6 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-[#E8DFD6] bg-[#FEFDFB]">
        <h2 className="text-xl font-semibold text-[#3E2723] font-inter tracking-[-0.2px] flex items-center gap-2.5 m-0">
          <span className="text-2xl">🛒</span>
          Order Summary
          <span className="inline-flex items-center justify-center bg-[#8B5A3C] text-[#FEFDFB] rounded-full px-2 py-0.5 text-xs font-semibold ml-2">
            {totalItems} items
          </span>
        </h2>
      </div>

      {/* Price Breakdown */}
      <div className="p-5 bg-[#F5F1EB] border-b border-[#E8DFD6]">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#6D4C41] font-inter">
            Items ({totalItems})
          </span>
          <span className="text-sm font-semibold text-[#3E2723] font-inter">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Subtotal */}
      <div className="p-5 bg-[#FEFDFB] border-b border-[#E8DFD6]">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#3E2723] font-inter">
            Subtotal
          </span>
          <span className="text-[22px] font-bold text-[#8B5A3C] font-inter tracking-[-0.3px]">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col gap-4 border-b border-[#E8DFD6]">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#8D6E63] font-inter flex items-center gap-2">
            <ClipboardList size={18} color="#6366f1" />
            Estimated Tax
          </span>
          <span className="text-sm font-semibold text-[#3E2723] font-inter">
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#8D6E63] font-inter flex items-center gap-2">
            <Truck size={18} color="#f59e0b" />
            Shipping
          </span>
          <span
            className={`text-sm font-semibold font-inter ${
              deliveryCharges === 0 ? "text-[#2E7D32]" : "text-[#3E2723]"
            }`}
          >
            {deliveryCharges === 0 ? "FREE" : `$${Number(deliveryCharges).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="p-6 bg-gradient-to-br from-[#F5F1EB] to-[#fef9f2] border-t-2 border-b-2 border-[#C9A27B]">
        <div className="flex justify-between items-baseline">
          <span className="text-base font-bold text-[#3E2723] font-inter uppercase tracking-[0.5px]">
            Total Amount
          </span>
          <span className="text-[28px] font-extrabold text-[#8B5A3C] font-inter tracking-[-0.5px]">
            ${Number(total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pb-5">
        <button
          onClick={handlePayment}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-[#FEFDFB] border-none rounded-xl text-sm font-semibold font-inter uppercase tracking-[0.8px] cursor-pointer transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8B5A3C]/30 active:translate-y-0 group"
        >
          Proceed to Checkout
          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

    </div>
  );
};

export default CheckoutSummary;