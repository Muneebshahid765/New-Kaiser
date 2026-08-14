"use client";

import React from "react";
import { OrderStatus } from "@/app/features/orders/schemas/buyer-order.schema";

interface BuyerOrderFiltersProps {
  selectedStatus: OrderStatus | "all";
  onStatusChange: (status: OrderStatus | "all") => void;
}

const filterTabs: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const BuyerOrderFilters: React.FC<BuyerOrderFiltersProps> = React.memo(
  ({ selectedStatus, onStatusChange }) => {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar border-b border-gray-200 mb-6">
        {filterTabs.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }
);

BuyerOrderFilters.displayName = "BuyerOrderFilters";