// src/app/(dashboard)/buyer/orders/page.tsx
"use client";

import React, { useState } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useBuyerOrders } from "@/app/features/orders/hooks/buyer-order.hooks";
import { OrderStatus } from "@/app/features/orders/schemas/buyer-order.schema";
import { BuyerOrderFilters } from "./BuyerOrderFilters";
import { BuyerOrderCard } from "./BuyerOrderCard";
import { BuyerOrderDetailDrawer } from "./BuyerOrderDetailDrawer";
import { BuyerOrdersSkeleton } from "./BuyerOrdersSkeleton";

export default function BuyerOrdersPage() {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useBuyerOrders({
    page,
    limit: 8,
    orderStatus: selectedStatus,
  });

  const handleStatusChange = (status: OrderStatus | "all") => {
    setSelectedStatus(status);
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500">Track and manage your order history</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <BuyerOrderFilters
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Orders List */}
      {isLoading ? (
        <BuyerOrdersSkeleton />
      ) : data?.orders && data.orders.length > 0 ? (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <BuyerOrderCard
              key={order.id}
              order={order}
              onSelect={(id) => setSelectedOrderId(id)}
            />
          ))}

          {/* Pagination Controls */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={!data.pagination.hasPrevPage || isFetching}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg flex items-center gap-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.hasNextPage || isFetching}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg flex items-center gap-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-slate-700">No orders found</p>
          <p className="text-xs text-slate-400">
            {selectedStatus !== "all"
              ? `You don't have any orders with status '${selectedStatus}'.`
              : "You haven't placed any orders yet."}
          </p>
        </div>
      )}

      {/* Order Detail Drawer */}
      <BuyerOrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}