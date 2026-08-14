"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";
import type { QueryOrderPayload, OrderStatus, PaymentStatus } from "@/app/features/orders/schemas/order.schema";

interface OrderFiltersBarProps {
  filters: QueryOrderPayload;
  onFilterChange: (filters: QueryOrderPayload) => void;
  onReset: () => void;
}

export const OrderFiltersBar: React.FC<OrderFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search ?? "");

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search ?? "")) {
        onFilterChange({ ...filters, search: searchTerm || undefined, page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const activeOrderStatus = filters.orderStatus;
  const activeStartDate = filters.dateFrom ?? filters.startDate ?? "";
  const activeEndDate = filters.dateTo ?? filters.endDate ?? "";

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by order #, customer name, email..."
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Order Status */}
       
       {/* Order Status Dropdown */}
<select
  value={activeOrderStatus ?? "all"}
  onChange={(e) =>
    onFilterChange({
      ...filters,
      orderStatus: e.target.value === "all" ? undefined : (e.target.value as OrderStatus),
      page: 1,
    })
  }
  className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  <option value="all">All Order Statuses</option>
  <option value="pending">Pending</option>
  <option value="confirmed">Confirmed</option>
  <option value="processing">Processing</option>
  <option value="shipped">Shipped</option>
  <option value="delivered">Delivered</option>
  <option value="cancelled">Cancelled</option>
</select>

{/* Payment Status Dropdown */}
<select
  value={filters.paymentStatus ?? "all"}
  onChange={(e) =>
    onFilterChange({
      ...filters,
      paymentStatus: e.target.value === "all" ? undefined : (e.target.value as PaymentStatus),
      page: 1,
    })
  }
  className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  <option value="all">All Payment Statuses</option>
  <option value="pending">Pending</option>
  <option value="paid">Paid</option>
  <option value="failed">Failed</option>
  <option value="refunded">Refunded</option>
  <option value="partially_refunded">Partially Refunded</option>
</select>

        {/* Date Filters */}
        <input
          type="date"
          value={activeStartDate}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dateFrom: e.target.value || undefined,
              startDate: e.target.value || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-gray-400 text-sm">to</span>
        <input
          type="date"
          value={activeEndDate}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dateTo: e.target.value || undefined,
              endDate: e.target.value || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            onReset();
          }}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};