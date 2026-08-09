'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreHorizontal,
  Edit3,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  Copy,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Flame,
} from 'lucide-react';
import type {
  InventoryProductItem,
  InventoryPagination,
} from '../../../features/products/types/product-response.types';
import { ProductThumb } from '../../ui/AppImage';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductTableProps {
  products: InventoryProductItem[];
  loading: boolean;
  selectedProducts: string[];
  onSelectProduct: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onAnalytics: (id: string) => void;
  onDelete: (id: string) => void;          // soft delete
  onHardDelete: (id: string) => void;      // permanent delete — NEW
  onDuplicate: (id: string) => void;
  onRestore: (id: string) => void;
  showActions: string | null;
  setShowActions: (id: string | null) => void;
  pagination: InventoryPagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  formatCurrency: (n: number) => string;
  filterStatus: string;
  deleteLoading: boolean;
  duplicateLoading: boolean;
  hardDeleteLoading: boolean;              // NEW
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────
const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0 || stock == null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
        <AlertCircle size={10} /> Out of Stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">
        <AlertTriangle size={10} /> Low ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
      <CheckCircle size={10} /> {stock}
    </span>
  );
};

// ─── Profit Margin ────────────────────────────────────────────────────────────
const ProfitMargin: React.FC<{ price: number; originalPrice?: number | null }> = ({
  price,
  originalPrice,
}) => {
  if (!originalPrice || originalPrice <= price) {
    return <span className="text-[#9ca3af] text-[12px]">—</span>;
  }
  const margin = Math.round(((originalPrice - price) / originalPrice) * 100);
  const color = margin >= 30 ? '#10b981' : margin >= 15 ? '#f59e0b' : '#ef4444';
  return (
    <span className="text-[13px] font-bold" style={{ color }}>
      {margin}%
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string; deleted: boolean }> = ({ status, deleted }) => {
  if (deleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
        <Trash2 size={11} /> Deleted
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
        <CheckCircle size={12} /> Active
      </span>
    );
  }
  if (status === 'archived') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
        <AlertTriangle size={11} /> Archived
      </span>
    );
  }
  // draft
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]">
      <XCircle size={12} /> Draft
    </span>
  );
};

// ─── Portal Dropdown ──────────────────────────────────────────────────────────
// Table has overflow-hidden + overflow-x-auto — normal absolute positioning
// clips the dropdown. Fix: render via React Portal directly onto document.body.
interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({ anchorRef, onClose, children }) => {
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  return createPortal(
    <>
      {/* Invisible overlay — click outside to close */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      {/* Dropdown */}
      <div
        style={{ top: coords.top, right: coords.right, position: 'absolute' }}
        className="z-[9999] bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.14)] min-w-[190px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body,
  );
};

// ─── Action Dropdown per row ──────────────────────────────────────────────────
interface ActionDropdownProps {
  productId: string;
  isDeleted: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onAnalytics: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onHardDelete: () => void;
  onRestore: () => void;
  deleteLoading: boolean;
  duplicateLoading: boolean;
  hardDeleteLoading: boolean;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  isDeleted,
  isOpen,
  onOpen,
  onClose,
  onEdit,
  onPreview,
  onAnalytics,
  onDuplicate,
  onDelete,
  onHardDelete,
  onRestore,
  deleteLoading,
  duplicateLoading,
  hardDeleteLoading,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          isOpen ? onClose() : onOpen();
        }}
        className="w-8 h-8 bg-transparent border-[1.5px] border-[#e5e7eb] rounded-[8px] cursor-pointer text-[#6b7280] flex items-center justify-center transition-colors hover:bg-[#f4f5f7] hover:border-[#4f6ef7] hover:text-[#4f6ef7]"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <DropdownPortal anchorRef={btnRef} onClose={onClose}>
          {/* ── DELETED product: Restore + Permanent Delete ─────────────── */}
          {isDeleted ? (
            <>
              <button
                onClick={() => { onRestore(); onClose(); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#10b981] cursor-pointer text-left transition-colors hover:bg-[#f0fdf4]"
              >
                <RotateCcw size={15} color="#10b981" />
                Restore Product
              </button>
              <div className="h-px bg-[#f3f4f6] my-1" />
              <button
                onClick={() => { onHardDelete(); onClose(); }}
                disabled={hardDeleteLoading}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#ef4444] cursor-pointer text-left transition-colors hover:bg-[#fef2f2] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flame size={15} color="#ef4444" />
                {hardDeleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </>
          ) : (
            /* ── NORMAL product: full action menu ──────────────────────── */
            <>
              <button
                onClick={() => { onEdit(); onClose(); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#111827] cursor-pointer text-left transition-colors hover:bg-[#f4f5f7]"
              >
                <Edit3 size={15} color="#3b82f6" /> Edit Product
              </button>
              <button
                onClick={() => { onPreview(); onClose(); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#111827] cursor-pointer text-left transition-colors hover:bg-[#f4f5f7]"
              >
                <Eye size={15} color="#10b981" /> Preview
              </button>
              <button
                onClick={() => { onAnalytics(); onClose(); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#111827] cursor-pointer text-left transition-colors hover:bg-[#f4f5f7]"
              >
                <BarChart3 size={15} color="#f59e0b" /> Analytics
              </button>
              <button
                onClick={() => { onDuplicate(); onClose(); }}
                disabled={duplicateLoading}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#111827] cursor-pointer text-left transition-colors hover:bg-[#f4f5f7] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy size={15} color="#8b5cf6" />
                {duplicateLoading ? 'Duplicating...' : 'Duplicate'}
              </button>
              <div className="h-px bg-[#f3f4f6] my-1" />
              <button
                onClick={() => { onDelete(); onClose(); }}
                disabled={deleteLoading}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-transparent border-none text-[14px] font-medium text-[#ef4444] cursor-pointer text-left transition-colors hover:bg-[#fef2f2] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
                {deleteLoading ? 'Deleting...' : 'Delete Product'}
              </button>
            </>
          )}
        </DropdownPortal>
      )}
    </div>
  );
};

// ─── Main Table ───────────────────────────────────────────────────────────────
const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onEdit,
  onPreview,
  onAnalytics,
  onDelete,
  onHardDelete,
  onDuplicate,
  onRestore,
  showActions,
  setShowActions,
  pagination,
  currentPage,
  onPageChange,
  formatCurrency,
  filterStatus,
  deleteLoading,
  duplicateLoading,
  hardDeleteLoading,
}) => {
  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-[#6b7280]">
        <Package size={48} className="text-[#4f6ef7] animate-pulse" />
        <h3 className="text-[18px] font-semibold">Loading products...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-[#e5e7eb] overflow-hidden">
      {/* overflow-x-auto is on THIS div — table itself doesn't clip dropdowns
          because we use Portal rendering */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-[#f9fafb] border-b-[1.5px] border-[#e5e7eb]">
              <th className="w-11 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 accent-[#4f6ef7] cursor-pointer rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Product</th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Price</th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Stock</th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Rating</th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Margin</th>
              <th className="px-4 py-3 text-left text-[12px] font-bold text-[#9ca3af] uppercase tracking-[0.6px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const productId = product.id || product._id;

              // ✅ FIX: product.deleted field se check karo — filterStatus pe depend mat karo
              const isDeleted = product.deleted === true;
              const isOutOfStock = !product.stockQuantity || product.stockQuantity === 0;

              return (
                <tr
                  key={productId}
                  className={`border-b border-[#f3f4f6] transition-colors hover:bg-[#f9fafb] ${
                    isDeleted ? 'opacity-55 bg-[#fef2f2]/30' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(productId)}
                      onChange={() => onSelectProduct(productId)}
                      className="w-4 h-4 accent-[#4f6ef7] cursor-pointer rounded"
                    />
                  </td>

                  {/* Product Info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <ProductThumb
                          src={product.images?.[0]?.url}
                          alt={product.name}
                          size={44}
                          className="w-11 h-11"
                        />
                        {isOutOfStock && !isDeleted && (
                          <div className="absolute inset-0 bg-black/45 rounded-[8px] flex items-center justify-center">
                            <span className="text-white text-[9px] font-extrabold text-center leading-tight">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                        {isDeleted && (
                          <div className="absolute inset-0 bg-red-500/40 rounded-[8px] flex items-center justify-center">
                            <Trash2 size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#111827] text-[14px] truncate max-w-[200px]">
                          {product.name}
                        </div>
                        <div className="text-[12px] text-[#9ca3af] mt-0.5 truncate max-w-[200px]">
                          {product.category?.name || '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 font-bold text-[#111827] text-[15px]">
                    {formatCurrency(product.price)}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-[11px] text-[#9ca3af] line-through font-normal">
                        {formatCurrency(product.originalPrice)}
                      </div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3.5">
                    <StockBadge stock={product.stockQuantity} />
                  </td>

                  {/* Status — ✅ FIX: deleted products ka sahi badge dikhao */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={product.status} deleted={isDeleted} />
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span className="font-bold text-[14px] text-[#111827]">
                        {product.averageRating || 0}
                      </span>
                      <span className="text-[12px] text-[#9ca3af]">
                        ({product.totalReviews || 0})
                      </span>
                    </div>
                  </td>

                  {/* Margin */}
                  <td className="px-4 py-3.5">
                    <ProfitMargin price={product.price} originalPrice={product.originalPrice} />
                  </td>

                  {/* Actions — ✅ FIX: Portal-based dropdown, no clipping */}
                  <td className="px-4 py-3.5">
                    <ActionDropdown
                      productId={productId}
                      isDeleted={isDeleted}
                      isOpen={showActions === productId}
                      onOpen={() => setShowActions(productId)}
                      onClose={() => setShowActions(null)}
                      onEdit={() => onEdit(productId)}
                      onPreview={() => onPreview(productId)}
                      onAnalytics={() => onAnalytics(productId)}
                      onDuplicate={() => onDuplicate(productId)}
                      onDelete={() => onDelete(productId)}
                      onHardDelete={() => onHardDelete(productId)}
                      onRestore={() => onRestore(productId)}
                      deleteLoading={deleteLoading}
                      duplicateLoading={duplicateLoading}
                      hardDeleteLoading={hardDeleteLoading}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <Package size={48} className="text-[#9ca3af] mb-4 opacity-60" />
          <h3 className="text-[18px] font-bold text-[#111827] m-0 mb-2">No products found</h3>
          <p className="text-[14px] text-[#9ca3af] m-0">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#f3f4f6]">
          <div className="text-[13px] text-[#9ca3af]">
            Showing {(currentPage - 1) * pagination.limit + 1}–
            {Math.min(currentPage * pagination.limit, pagination.totalProducts)} of{' '}
            {pagination.totalProducts} products
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent border-[1.5px] border-[#e5e7eb] rounded-[8px] text-[13px] font-semibold text-[#111827] cursor-pointer transition-colors hover:border-[#4f6ef7] hover:text-[#4f6ef7] hover:bg-[#f0f3ff] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - currentPage) <= 2,
                )
                .map((p, idx, arr) => {
                  const showDots = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showDots && (
                        <span className="px-1 text-[#9ca3af] text-[14px]">…</span>
                      )}
                      <button
                        onClick={() => onPageChange(p)}
                        className={`w-[34px] h-[34px] flex items-center justify-center border-[1.5px] border-[#e5e7eb] rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all hover:border-[#4f6ef7] hover:text-[#4f6ef7] ${
                          currentPage === p
                            ? 'bg-[#1a1d27] border-[#1a1d27] text-white hover:bg-[#252838]'
                            : 'bg-transparent text-[#6b7280]'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent border-[1.5px] border-[#e5e7eb] rounded-[8px] text-[13px] font-semibold text-[#111827] cursor-pointer transition-colors hover:border-[#4f6ef7] hover:text-[#4f6ef7] hover:bg-[#f0f3ff] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;