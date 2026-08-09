"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  DollarSign,
  LayoutGrid,
  Package,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";

import {
  useCategories,
  useDeleteCategory,
  useBulkDeleteCategories,
  useBulkUpdateCategoryStatus,
} from "@/app/features/categories/hooks/category.hooks";
import { modals } from "@/hooks/store/useModalStore";
import { CategoryTableRow, formatCurrency } from "./CategoryTableRow";
import { CategoryListSkeleton } from "./CategorySkeleton";
import type { CategoryDeleteConflictResponse } from "@/app/features/categories/types/category-reponse.types";

// ─── Pagination constants ─────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

// ─── Main Component ───────────────────────────────────────────────────────────
export function CategoryListPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: categories = [], isLoading } = useCategories({ status: "all" });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteCategory();
  const bulkDeleteMutation = useBulkDeleteCategories();
  const bulkStatusMutation = useBulkUpdateCategoryStatus();

  const isMutating =
    deleteMutation.isPending ||
    bulkDeleteMutation.isPending ||
    bulkStatusMutation.isPending;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConflict, setDeleteConflict] = useState<
    (CategoryDeleteConflictResponse & { id: string }) | null
  >(null);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalActive = useMemo(
    () => categories.filter((c) => c.status === "active").length,
    [categories],
  );
  const totalInactive = useMemo(
    () => categories.filter((c) => c.status === "inactive").length,
    [categories],
  );
  const totalProducts = useMemo(
    () => categories.reduce((s, c) => s + (c.productCount ?? 0), 0),
    [categories],
  );
  const totalRevenue = useMemo(
    () => categories.reduce((s, c) => s + (c.totalRevenue ?? 0), 0),
    [categories],
  );

  // ── Filtering + pagination ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...categories];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    return list;
  }, [categories, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === filtered.length ? [] : filtered.map((c) => c.id),
    );
  }, [filtered]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (id: string) => {
      modals.confirm({
        title: "Delete Category",
        description:
          "Are you sure you want to delete this category? This action cannot be undone.",
        variant: "danger",
        confirmText: "Delete",
        onConfirm: () => {
          deleteMutation.mutate(
            { id, force: false },
            {
              onError: (err: unknown) => {
                const raw = (err as { raw?: CategoryDeleteConflictResponse })?.raw;
                if (raw?.productCount) {
                  setDeleteConflict({ ...raw, id });
                }
              },
            },
          );
        },
      });
    },
    [deleteMutation],
  );

  const handleForceDelete = useCallback(() => {
    if (!deleteConflict) return;
    deleteMutation.mutate(
      { id: deleteConflict.id, force: true },
      { onSettled: () => setDeleteConflict(null) },
    );
  }, [deleteConflict, deleteMutation]);

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulkDelete = useCallback(() => {
    if (!selectedIds.length) return;
    modals.confirm({
      title: "Bulk Delete",
      description: `Delete ${selectedIds.length} selected categories? Products will be reassigned to "Uncategorized".`,
      variant: "danger",
      confirmText: "Delete All",
      onConfirm: () => {
        bulkDeleteMutation.mutate(
          { ids: selectedIds, force: false },
          { onSuccess: () => setSelectedIds([]) },
        );
      },
    });
  }, [selectedIds, bulkDeleteMutation]);

  const handleBulkStatus = useCallback(
    (status: "active" | "inactive") => {
      if (!selectedIds.length) return;
      modals.confirm({
        title: "Update Status",
        description: `Set ${selectedIds.length} categories to "${status}"?`,
        variant: "warning",
        confirmText: "Yes, Update",
        onConfirm: () => {
          bulkStatusMutation.mutate(
            { ids: selectedIds, status },
            { onSuccess: () => setSelectedIds([]) },
          );
        },
      });
    },
    [selectedIds, bulkStatusMutation],
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) return <CategoryListSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 p-4 sm:p-6 lg:p-8">
  

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {categories.length} categories · {totalProducts} products
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Category
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatsCard
          icon={<LayoutGrid size={18} />}
          label="Total"
          value={categories.length}
          sub="All categories"
          accent="#6366f1"
        />
        <StatsCard
          icon={<CheckCircle size={18} />}
          label="Active"
          value={totalActive}
          sub="Active categories"
          accent="#10b981"
        />
        <StatsCard
          icon={<X size={18} />}
          label="Inactive"
          value={totalInactive}
          sub="Inactive"
          accent="#ef4444"
        />
        <StatsCard
          icon={<Package size={18} />}
          label="Products"
          value={totalProducts}
          sub="Across all"
          accent="#f59e0b"
        />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-stone-100 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 placeholder:text-stone-400 transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => handleBulkStatus("active")}
                disabled={isMutating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-60"
              >
                <CheckCircle size={12} /> Set Active
              </button>
              <button
                onClick={() => handleBulkStatus("inactive")}
                disabled={isMutating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                <X size={12} /> Set Inactive
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isMutating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                <Trash size={12} /> Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70">
                <th className="pl-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-stone-300 accent-stone-900 cursor-pointer"
                  />
                </th>
                {[
                  "Image",
                  "Category",
                  "Status",
                  "Products",
                  "Revenue",
                  "Rating",
                  "Stock",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider ${
                      h === "Revenue"
                        ? "hidden lg:table-cell"
                        : h === "Rating" || h === "Stock"
                          ? "hidden xl:table-cell"
                          : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((cat) => (
                <CategoryTableRow
                  key={cat.id}
                  cat={cat}
                  selected={selectedIds.includes(cat.id)}
                  onSelect={() => toggleSelect(cat.id)}
                  onDelete={handleDelete}
                  isDeleting={isMutating}
                  expandedId={expandedId}
                  onToggleExpand={(id) =>
                    setExpandedId((prev) => (prev === id ? null : id))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
              <Package size={28} className="text-stone-400" />
            </div>
            <h3 className="text-base font-bold text-stone-800 mb-1">
              No Categories Found
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No categories match your filters."
                : "Create your first category to get started."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t border-stone-100">
            <PaginationBtn
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </PaginationBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === p
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {p}
              </button>
            ))}
            <PaginationBtn
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next →
            </PaginationBtn>
            <span className="ml-2 text-xs text-stone-400">
              Page {currentPage}/{totalPages} · {filtered.length} total
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StatsCard ────────────────────────────────────────────────────────────────
function StatsCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}14`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-stone-900 tracking-tight">
        {value}
      </p>
      <p className="text-xs text-stone-400">{sub}</p>
    </div>
  );
}

// ─── PaginationBtn ────────────────────────────────────────────────────────────
function PaginationBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}