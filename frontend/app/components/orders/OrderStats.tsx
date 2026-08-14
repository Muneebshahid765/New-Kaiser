"use client";

import React from "react";
import { DollarSign, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import type { OrderStatistics } from "@/app/features/orders/types/order-response.types";

interface OrderStatsProps {
  stats?: OrderStatistics;
  isLoading: boolean;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0.00",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Processing",
      value: stats?.processingOrders ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Shipped",
      value: stats?.shippedOrders ?? 0,
      icon: Truck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Delivered",
      value: stats?.deliveredOrders ?? 0,
      icon: CheckCircle2,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      title: "Cancelled",
      value: stats?.cancelledOrders ?? 0,
      icon: XCircle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">{card.title}</span>
              <div className={`p-1.5 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
          </div>
        );
      })}
    </div>
  );
};