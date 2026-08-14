"use client"
import React from "react";
import {
  
  ShoppingBag,
  Heart,
  ShoppingCart,
  Bell,
  User,
  MapPin,
  Clock,
  Truck,
  Award,
  ChevronRight,
  
  Star,

} from "lucide-react";
import { useBuyerDashboard } from "@/app/features/dashboard/hooks/buyer-dashboard.hooks";
import { AppImage, ProductThumb } from "@/app/components/ui/AppImage";


export function BuyerDashboardView() {
  const { data, isLoading, error } = useBuyerDashboard({ limit: 4 });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-emerald-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-red-500 font-medium">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const {
    user,
    metrics,
    recentOrders,
    orderStatusChart,
    recommendedProducts,
    accountSummary,
  } = data.data;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* Dashboard Body */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-100/60 rounded-3xl p-8 flex items-center justify-between">
            <div className="space-y-2 max-w-md z-10">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user.fullName.split(" ")[0]}! 👋
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Here's what's happening with your account today.
              </p>
            </div>
            {/* Banner Vector Illustration Placeholder */}
            <div className="hidden md:flex items-center justify-center w-48 h-24">
              <div className="relative">
                <div className="w-20 h-20 bg-teal-500/20 rounded-2xl rotate-12 absolute -top-2 left-0 backdrop-blur-sm"></div>
                <div className="w-20 h-20 bg-emerald-500/30 rounded-2xl -rotate-6 relative z-10 flex items-center justify-center text-teal-700 shadow-sm">
                  <ShoppingBag className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics.totalOrders.value}
                </h3>
              </div>
              <p className="text-xs font-semibold text-emerald-600">
                {metrics.totalOrders.changeThisMonth}
              </p>
            </div>

            {/* Pending Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Pending Orders
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics.pendingOrders.value}
                </h3>
              </div>
              <p className="text-xs font-semibold text-amber-600">
                {metrics.pendingOrders.changeThisMonth}
              </p>
            </div>

            {/* Delivered Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Delivered Orders
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics.deliveredOrders.value}
                </h3>
              </div>
              <p className="text-xs font-semibold text-emerald-600">
                {metrics.deliveredOrders.changeThisMonth}
              </p>
            </div>

            {/* Reward Points */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Reward Points
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics.rewardPoints.value.toLocaleString()}
                </h3>
              </div>
              <p className="text-xs font-semibold text-emerald-600">
                {metrics.rewardPoints.changeThisMonth}
              </p>
            </div>
          </div>

          {/* Middle Row: Recent Orders & Order Status Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders (2 Columns) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Recent Orders
                </h3>
                <a
                  href="#"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All
                </a>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                     <ProductThumb
  src={order.image}
  alt={order.title}
  size={48}
/>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {order.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Order #{order.orderNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-bold text-slate-900 text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <button className="text-slate-300 hover:text-slate-600">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Donut Chart (1 Column) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Order Status
              </h3>

              {/* Donut Chart SVG */}
              <div className="relative flex items-center justify-center my-4">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Delivered Segment */}
                  <path
                    className="text-teal-500"
                    strokeDasharray="60, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Shipped Segment */}
                  <path
                    className="text-sky-400"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-60"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Processing Segment */}
                  <path
                    className="text-amber-400"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-80"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-slate-900 block">
                    {orderStatusChart.total}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span>
                    Delivered ({orderStatusChart.breakdown.delivered})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <span>Shipped ({orderStatusChart.breakdown.shipped})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>
                    Processing ({orderStatusChart.breakdown.processing})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span>
                    Cancelled ({orderStatusChart.breakdown.cancelled})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recommended Products & Account Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recommended Products (2 Columns) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Recommended for You
                </h3>
                <a
                  href="#"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-square rounded-xl bg-white border border-slate-100 overflow-hidden mb-3 flex items-center justify-center">
                      <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-slate-400 hover:text-rose-500 shadow-sm">
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                     <AppImage
  src={product.image}
  alt={product.name}
  width={150}
  height={150}
  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
/>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-800 text-xs line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="font-bold text-slate-900 text-xs">
                        ${product.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 pt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Summary (1 Column) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
              <h3 className="font-bold text-slate-900 text-base">
                Account Summary
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    <span>Member Since</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {accountSummary.memberSince}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Account Type</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{accountSummary.accountType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShoppingCart className="w-4 h-4 text-slate-400" />
                    <span>Total Spent</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${accountSummary.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Saved Addresses</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {accountSummary.savedAddressesCount} Addresses
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-600/10">
                <span>View Full Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2024 Africa Kaiser. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-600">
                Terms & Conditions
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

// ─── Status Badge Sub-component ──────────────────────────────────────────────
function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
    shipped: "bg-sky-50 text-sky-600 border-sky-100",
    processing: "bg-amber-50 text-amber-600 border-amber-100",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const formattedStatus =
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
        styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {formattedStatus}
    </span>
  );
}