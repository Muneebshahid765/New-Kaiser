"use client";

import React from "react";
import { Eye } from "lucide-react";
import type { OrderListItem } from "@/app/features/orders/types/order-response.types";
import type { OrderStatus, PaymentStatus } from "@/app/features/orders/schemas/order.schema";

interface OrderTableProps {
  orders: OrderListItem[];
  isLoading: boolean;
  onSelectOrder: (orderId: string) => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const paymentColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-rose-50 text-rose-800 border-rose-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",
  partially_refunded: "bg-orange-50 text-orange-800 border-orange-200",
};

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  onSelectOrder,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
          Loading Orders...
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 font-medium">No orders matched your active criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Order Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {orders.map((order) => {
              const orderStatus = order.orderStatus;
              
              // Safe fallback check: reads direct itemCount or array length
              const itemCount = (order as any).itemCount ?? order.items?.length ?? 0;
              const totalAmount = order.totalAmount ?? 0;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectOrder(order.id)}
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-indigo-600">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-400">{order.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${
                        statusColors[orderStatus] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${
                        paymentColors[order.paymentStatus] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                    ${Number(totalAmount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};