"use client";

import React, { useState } from "react";
import { useOrders } from "@/app/features/orders/hooks/order.hooks";
import { OrderStats } from "./OrderStats";
import { OrderTable } from "./OrderTable";
import { OrderFiltersBar } from "./OrderFiltersBar";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import type { QueryOrderPayload } from "@/app/features/orders/schemas/order.schema";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminOrdersPage() {
  const initialFilters: QueryOrderPayload = { page: 1, limit: 10 };
  const [filters, setFilters] = useState<QueryOrderPayload>(initialFilters);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useOrders(filters);

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;
  const stats = data?.statistics;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500">NestJS Backend Integrated Admin Dashboard</p>
        </div>

        {/* Executive Stats */}
        <OrderStats stats={stats} isLoading={isLoading} />

        {/* Modular Filters Bar */}
        <OrderFiltersBar
          filters={filters}
          onFilterChange={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters(initialFilters)}
        />

        {/* Order Table Component */}
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onSelectOrder={(id) => setSelectedOrderId(id)}
        />

        {/* Pagination Controls */}
        {pagination && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between text-xs text-gray-600">
            <div>
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="p-2 border rounded bg-white disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="p-2 border rounded bg-white disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </main>
  );
}