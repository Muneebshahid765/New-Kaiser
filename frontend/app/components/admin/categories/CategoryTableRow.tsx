"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  BarChart2,
  CheckCircle,
  DollarSign,
  Edit,
  ShoppingCart,
  Star,
  Trash,
  TrendingUp,
  X,
} from "lucide-react";
import type { CategoryListItem } from "@/app/features/categories/types/category-reponse.types";
import { ProductThumb } from "@/app/components/ui/AppImage";

interface InsightPillProps {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactElement;
}

function InsightPill({ label, value, color, icon }: InsightPillProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{
        background: `${color}12`,
        borderColor: `${color}28`,
        color,
      }}
    >
      {React.cloneElement(icon, { size: 11 } as React.SVGProps<SVGSVGElement>)}
      <span className="text-stone-600">{label}: </span>
      <span style={{ color }}>{value}</span>
    </span>
  );
}

export function formatCurrency(n?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

interface CategoryTableRowProps {
  cat: CategoryListItem;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

export function CategoryTableRow({
  cat,
  selected,
  onSelect,
  onDelete,
  isDeleting,
  expandedId,
  onToggleExpand,
}: CategoryTableRowProps) {
  const isExpanded = expandedId === cat.id;
  const outOfStockPct =
    cat.productCount > 0
      ? Math.round((cat.outOfStockCount / cat.productCount) * 100)
      : 0;

  // Image path safety check (Object vs String handling)
  const imageSrc =
    typeof cat.image === "string" ? cat.image : cat.image?.path;

  return (
    <React.Fragment>
      <tr
        className={`group border-b border-stone-100 transition-colors ${
          selected ? "bg-stone-50/80" : "hover:bg-stone-50/40"
        }`}
      >
        {/* Checkbox */}
        <td className="pl-5 py-3.5 w-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-stone-300 accent-stone-900 cursor-pointer"
          />
        </td>

        {/* Fixed Aspect-Ratio Table Image */}
        <td className="px-3 py-3.5 w-14 shrink-0">
          <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-stone-200/80 bg-stone-50 flex items-center justify-center">
            <ProductThumb
              src={imageSrc}
              alt={cat.name}
              size={44}
              className="w-full h-full object-cover"
            />
          </div>
        </td>

        {/* Name + description */}
        <td className="px-3 py-3.5 min-w-[160px]">
          <p className="text-sm font-bold text-stone-900 leading-tight">
            {cat.name}
          </p>
          <p className="text-xs text-stone-400 mt-0.5 max-w-[220px] truncate">
            {cat.description}
          </p>
        </td>

        {/* Status */}
        <td className="px-3 py-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              cat.status === "active"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                : "bg-red-50 text-red-700 border border-red-200/70"
            }`}
          >
            {cat.status === "active" ? <CheckCircle size={11} /> : <X size={11} />}
            {cat.status === "active" ? "Active" : "Inactive"}
          </span>
        </td>

        {/* Products */}
        <td className="px-3 py-3.5">
          <p className="text-sm font-bold text-stone-900">{cat.productCount ?? 0}</p>
          <p className="text-xs text-stone-400">{cat.activeProductCount ?? 0} active</p>
        </td>

        {/* Revenue */}
        <td className="px-3 py-3.5 hidden lg:table-cell">
          <p className="text-sm font-bold text-stone-900">
            {formatCurrency(cat.totalRevenue)}
          </p>
          <p className="text-xs text-stone-400">{cat.totalOrders ?? 0} orders</p>
        </td>

        {/* Rating */}
        <td className="px-3 py-3.5 hidden xl:table-cell">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-stone-900">
              {cat.avgRating || "—"}
            </span>
          </div>
          <p className="text-xs text-stone-400">{cat.totalReviews ?? 0} reviews</p>
        </td>

        {/* Stock */}
        <td className="px-3 py-3.5 hidden xl:table-cell">
          <p className="text-sm font-bold text-stone-900">
            {cat.totalStock ?? "—"}
          </p>
          {cat.outOfStockCount > 0 ? (
            <p className="text-xs text-red-500 font-semibold">
              {cat.outOfStockCount} out of stock
            </p>
          ) : cat.lowStockCount > 0 ? (
            <p className="text-xs text-amber-500 font-semibold">
              {cat.lowStockCount} low stock
            </p>
          ) : null}
        </td>

        {/* Actions */}
        <td className="px-3 py-3.5 pr-5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleExpand(cat.id)}
              title="Insights"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isExpanded
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              <BarChart2 size={14} />
            </button>
            <Link
              href={`/admin/categories/${cat.id}/edit`}
              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
              title="Edit"
            >
              <Edit size={14} />
            </Link>
            <button
              onClick={() => onDelete(cat.id)}
              disabled={isDeleting}
              title="Delete"
              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded insights row */}
      {isExpanded && (
        <tr className="bg-stone-50/80 border-b border-stone-100">
          <td colSpan={9} className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
                Insights
              </span>
              <InsightPill
                label="Avg Price"
                value={`$${cat.avgPrice ?? 0}`}
                color="#6366f1"
                icon={<DollarSign />}
              />
              <InsightPill
                label="Orders"
                value={cat.totalOrders ?? 0}
                color="#f59e0b"
                icon={<ShoppingCart />}
              />
              <InsightPill
                label="Revenue"
                value={formatCurrency(cat.totalRevenue)}
                color="#10b981"
                icon={<TrendingUp />}
              />
              <InsightPill
                label="Avg Rating"
                value={cat.avgRating ?? "N/A"}
                color="#8b5cf6"
                icon={<Star />}
              />
              <InsightPill
                label="Reviews"
                value={cat.totalReviews ?? 0}
                color="#3b82f6"
                icon={<Star />}
              />
              <InsightPill
                label="Stock"
                value={cat.totalStock ?? 0}
                color="#0ea5e9"
                icon={<Archive />}
              />
              {cat.outOfStockCount > 0 && (
                <InsightPill
                  label="Out of Stock"
                  value={`${cat.outOfStockCount} (${outOfStockPct}%)`}
                  color="#ef4444"
                  icon={<AlertTriangle />}
                />
              )}
              {cat.lowStockCount > 0 && (
                <InsightPill
                  label="Low Stock"
                  value={cat.lowStockCount}
                  color="#f59e0b"
                  icon={<AlertTriangle />}
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}