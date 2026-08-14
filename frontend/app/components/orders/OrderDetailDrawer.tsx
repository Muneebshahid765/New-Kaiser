"use client";

import React, { useState } from "react";
import {
  X,
  Truck,
  User,
  Package,
  AlertCircle,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  useOrderDetails,
  useUpdateOrderStatus,
  useCancelPayment,
} from "@/app/features/orders/hooks/order.hooks";
import type { OrderStatus } from "@/app/features/orders/schemas/order.schema";
import { AppImage } from "@/app/components/ui/AppImage"; // Adjust path if needed

interface OrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

const statusBadgeStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  orderId,
  onClose,
}) => {
  const { data: orderResponse, isLoading } = useOrderDetails(orderId ?? undefined);
  const order = orderResponse?.order;

  const updateStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelPayment();

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  if (!orderId) return null;

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    updateStatusMutation.mutate({
      id: orderId,
      payload: { orderStatus: newStatus },
    });
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    cancelOrderMutation.mutate(
      { id: orderId },
      {
        onSuccess: () => {
          setShowCancelInput(false);
          setCancelReason("");
        },
      }
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300">
        
        {/* ─── HEADER ─── */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 font-mono">
                #{order?.orderNumber ?? "..."}
              </h2>
              {order && (
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${
                    statusBadgeStyles[order.orderStatus]
                  }`}
                >
                  {order.orderStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── BODY CONTENT ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-28 bg-gray-100 rounded-xl" />
              <div className="h-44 bg-gray-100 rounded-xl" />
            </div>
          ) : order ? (
            <>
              {/* Status Update Control Box */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Manage Order Status
                  </label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value as OrderStatus)}
                    disabled={updateStatusMutation.isPending}
                    className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Payment Info
                  </span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 uppercase">
                      {order.paymentStatus} ({order.paymentMethod ?? "CARD"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Notes / Alert Banner (If Any) */}
              {order.orderNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Order Note:</span> {order.orderNotes}
                  </div>
                </div>
              )}

              {/* Customer & Shipping Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider border-b pb-2">
                    <User className="w-4 h-4" /> Customer Details
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {order.customerEmail}
                    </p>
                    {order.customerPhone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {order.customerPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider border-b pb-2">
                    <Truck className="w-4 h-4" /> Shipping Destination
                  </div>
                  {order.shippingAddress ? (
                    <div className="text-xs text-gray-600 space-y-0.5 leading-relaxed">
                      <p className="font-medium text-gray-800">
                        {order.shippingAddress.address1}
                      </p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="font-semibold text-gray-700">{order.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No shipping details specified.</p>
                  )}
                </div>
              </div>

              {/* Purchased Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" /> Purchased Items ({order.items?.length ?? 0})
                  </h4>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {order.items?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* AppImage Component Used Here */}
                        <AppImage
                          src={item.image}
                          alt={item?.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg border border-slate-200 shrink-0"
                          iconSize={20}
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Qty: <span className="font-semibold text-gray-700">{item.quantity}</span> × ${Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-900 font-mono">
                        ${Number(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charges</span>
                  <span className="font-mono font-medium">${Number(order.deliveryCharges).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-sm pt-2 border-t border-gray-200">
                  <span>Total Paid</span>
                  <span className="font-mono text-indigo-600">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Order Timestamps & Audit Info */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Created: {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Updated: {formatDate(order.updatedAt)}
                </div>
                {order.trackingNumber && (
                  <div className="col-span-2 flex items-center gap-1.5 text-indigo-600 font-medium">
                    <FileText className="w-3.5 h-3.5" /> Tracking #: {order.trackingNumber}
                  </div>
                )}
              </div>

              {/* Order Cancellation Zone */}
              {order.orderStatus !== "cancelled" && (
                <div className="border-t border-gray-200 pt-4">
                  {!showCancelInput ? (
                    <button
                      onClick={() => setShowCancelInput(true)}
                      className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  ) : (
                    <form onSubmit={handleCancel} className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" /> Confirm Order Cancellation
                      </div>
                      <input
                        type="text"
                        placeholder="Reason for cancellation..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCancelInput(false)}
                          className="px-3 py-1.5 text-xs border border-gray-300 bg-white rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                          Dismiss
                        </button>
                        <button
                          type="submit"
                          disabled={cancelOrderMutation.isPending}
                          className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
                        >
                          Confirm Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">Failed to load order information.</div>
          )}
        </div>
      </div>
    </div>
  );
};