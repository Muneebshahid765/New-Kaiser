// src/app/features/orders/components/BuyerOrderDetailDrawer.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  useBuyerOrderDetail,
  useCancelBuyerOrder,
} from "@/app/features/orders/hooks/buyer-order.hooks";
import { AppImage } from "@/app/components/ui/AppImage";

interface BuyerOrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

export const BuyerOrderDetailDrawer: React.FC<BuyerOrderDetailDrawerProps> = ({
  orderId,
  onClose,
}) => {
  const { data, isLoading } = useBuyerOrderDetail(orderId);
  const cancelOrderMutation = useCancelBuyerOrder();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!orderId) return null;

  const order = data?.order;

  const canCancel =
    order?.orderStatus === "pending" || order?.orderStatus === "confirmed";

  const handleCancel = () => {
    if (!orderId) return;
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => setShowCancelPrompt(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-mono">
              Order #{order?.orderNumber ?? "..."}
            </h2>
            <p className="text-xs text-slate-400">ID: {orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-32 bg-slate-100 rounded-xl" />
              <div className="h-40 bg-slate-100 rounded-xl" />
            </div>
          ) : order ? (
            <>
              {/* Status Alert Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Current Status
                  </span>
                  <span className="text-sm font-bold text-indigo-600 uppercase">
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Payment Status
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 uppercase">
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" /> Items Ordered ({order.items.length})
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AppImage
                          src={item.image}
                          alt={item.name}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-lg border border-slate-200 object-cover"
                          iconSize={18}
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Shipping Destination
                </h4>
                <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-slate-800">{order.customerName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="font-medium text-slate-700">{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Calculations */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charges</span>
                  <span className="font-mono">${order.deliveryCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Paid</span>
                  <span className="font-mono text-indigo-600">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Cancellation Zone */}
              {canCancel && (
                <div className="pt-2 border-t border-slate-200">
                  {!showCancelPrompt ? (
                    <button
                      onClick={() => setShowCancelPrompt(true)}
                      className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancel Order
                    </button>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                      <p className="text-xs font-semibold text-rose-900">
                        Are you sure you want to cancel this order?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCancelPrompt(false)}
                          className="flex-1 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                        >
                          Keep Order
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={cancelOrderMutation.isPending}
                          className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                        >
                          {cancelOrderMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Order details could not be loaded.</p>
          )}
        </div>
      </div>
    </div>
  );
};