// src/app/features/orders/components/BuyerOrderCard.tsx
"use client";

import React from "react";
import { ChevronRight, Calendar, PackageCheck, ShieldAlert } from "lucide-react";
import { BuyerOrderListItem } from "@/app/features/orders/types/buyer-order-response.types";
import { OrderStatus } from "@/app/features/orders/schemas/buyer-order.schema";
import { AppImage } from "@/app/components/ui/AppImage";

interface BuyerOrderCardProps {
  order: BuyerOrderListItem;
  onSelect: (orderId: string) => void;
}

const statusBadgeStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export const BuyerOrderCard: React.FC<BuyerOrderCardProps> = React.memo(
  ({ order, onSelect }) => {
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    return (
      <div
        onClick={() => onSelect(order.id)}
        className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 font-mono">
                #{order.orderNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  statusBadgeStyles[order.orderStatus]
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Total Paid</span>
            <span className="text-base font-extrabold text-indigo-600 font-mono">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Middle: Preview Items */}
        <div className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex -space-x-2 overflow-hidden shrink-0">
              {order.previewItems.map((item) => (
                <AppImage
                  key={item.id}
                  src={item.productImage}
                  alt={item.productName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg border-2 border-white object-cover bg-slate-50"
                  iconSize={16}
                />
              ))}
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                {order.previewItems[0]?.productName || "Product"}
              </p>
              <p className="text-slate-400 font-medium">
                {order.totalItemsCount > 1
                  ? `+${order.totalItemsCount - 1} more item(s)`
                  : `Qty: ${order.previewItems[0]?.quantity ?? 1}`}
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            Details <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Payment Info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="uppercase font-semibold tracking-wider bg-slate-100 px-2 py-0.5 rounded">
            {order.paymentMethod}
          </span>
          <span className="capitalize font-medium text-slate-600">
            Payment: <strong className="text-slate-800">{order.paymentStatus}</strong>
          </span>
        </div>
      </div>
    );
  }
);

BuyerOrderCard.displayName = "BuyerOrderCard";