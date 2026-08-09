'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Upload,
  Edit3,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useProductInventory } from '../hooks/useProductInventory';
import ProductTable from './ProductTable';
import { BulkEditModal } from './BulkEditModal';
import { modals } from '@/hooks/store/useModalStore';

const ProductInventory: React.FC = () => {
  const router = useRouter();

  const {
    products,
    loading,
    pagination,
    selectedProducts,
    searchTerm,
    setSearchTerm,
    filterStatus,
    showActions,
    setShowActions,
    currentPage,
    showBulkEditModal,
    setShowBulkEditModal,
    stats,
    formatCurrency,
    handlePageChange,
    handleFilterChange,
    handleSelectProduct,
    handleSelectAll,
    setSelectedProducts,
    deleteProductMutation,
    duplicateProductMutation,
    restoreProductMutation,
    bulkUpdateMutation,
    hardDeleteMutation,             // NEW
  } = useProductInventory();

  // ── Navigation ───────────────────────────────────────────────────────────────
  const handleEdit     = (id: string) => router.push(`/product/updateProduct/${id}`);
  const handlePreview  = (id: string) => router.push(`/product/${id}`);
  const handleAnalytics= (id: string) => router.push(`/products/${id}/analytics`);

  // ── Soft Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    setShowActions(null);
    modals.confirm({
      title: 'Delete Product',
      description:
        'Product soft-delete ho jayega (recoverable). Images retain hongi. ' +
        'Permanently delete karne ke liye "Deleted" filter mein jao.',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteProductMutation.mutateAsync(id);
      },
    });
  };

  // ── Hard Delete ───────────────────────────────────────────────────────────────
  // Only shown in dropdown when product.deleted === true
  const handleHardDelete = (id: string) => {
    setShowActions(null);
    modals.confirm({
      title: 'Permanently Delete Product',
      description:
        '⚠️ Yeh action irreversible hai. Product aur uski saari images permanently delete ho ' +
        'jaayengi. Agar is product par koi order hai toh yeh action fail ho jayega.',
      variant: 'danger',
      confirmText: 'Delete Forever',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await hardDeleteMutation.mutateAsync(id);
      },
    });
  };

  // ── Duplicate ────────────────────────────────────────────────────────────────
  const handleDuplicate = (id: string) => {
    setShowActions(null);
    modals.confirm({
      title: 'Duplicate Product',
      description: 'Is product ki copy banani hai?',
      variant: 'info',
      confirmText: 'Yes, Duplicate',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await duplicateProductMutation.mutateAsync(id);
      },
    });
  };

  // ── Restore ──────────────────────────────────────────────────────────────────
  const handleRestore = (id: string) => {
    setShowActions(null);
    modals.confirm({
      title: 'Restore Product',
      description: 'Product restore ho jayega aur Draft status mein aa jayega.',
      variant: 'success',
      confirmText: 'Yes, Restore',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await restoreProductMutation.mutateAsync(id);
      },
    });
  };

  // ── Bulk Delete ───────────────────────────────────────────────────────────────
  const handleBulkDelete = () => {
    if (!selectedProducts.length) return;
    modals.confirm({
      title: 'Delete Multiple Products',
      description: `${selectedProducts.length} product(s) soft-delete ho jaayenge.`,
      variant: 'danger',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        for (const id of selectedProducts) {
          await deleteProductMutation.mutateAsync(id);
        }
        setSelectedProducts([]);
      },
    });
  };

  // ── Bulk Edit Submit ──────────────────────────────────────────────────────────
  const handleBulkEditSubmit = async ({ form, labels, features, highlights }: any) => {
    const updates: any = {};

    ['price', 'originalPrice', 'deliveryCharges', 'stockQuantity'].forEach((field) => {
      if (form[field] !== '' && !Number.isNaN(Number(form[field]))) {
        updates[field] = Number(form[field]);
      }
    });

    if (form.status)                updates.status          = form.status;
    if (form.deliveryRule?.trim())  updates.deliveryRule    = form.deliveryRule.trim();
    if (form.insuranceDetails?.trim()) updates.insuranceDetails = form.insuranceDetails.trim();
    if (form.categoryId)            updates.categoryId      = form.categoryId;

    if (labels?.length) {
      updates.labels = labels
        .filter((l: any) => l.text.trim())
        .map((l: any) => ({ text: l.text.trim(), variant: l.variant || 'primary' }));
    }

    if (features?.length) {
      const filtered = features.filter((f: string) => f.trim());
      if (filtered.length) updates.features = filtered;
    }

    if (highlights?.length) {
      const filtered = highlights.filter((h: string) => h.trim());
      if (filtered.length) updates.highlights = filtered;
    }

    if (!Object.keys(updates).length) {
      setShowBulkEditModal(false);
      return;
    }

    await bulkUpdateMutation.mutateAsync({ productIds: selectedProducts, updates });
    setShowBulkEditModal(false);
    setSelectedProducts([]);
  };

  // ── Stat Cards ────────────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { icon: <Package size={20} color="#3b82f6" />,    bg: '#3b82f620', value: stats.totalProducts,  label: 'Total Products' },
    { icon: <CheckCircle size={20} color="#10b981" />, bg: '#10b98120', value: stats.activeProducts, label: 'Active'         },
    { icon: <XCircle size={20} color="#6b7280" />,     bg: '#6b728020', value: stats.draftProducts,  label: 'Draft'          },
    { icon: <ShoppingCart size={20} color="#f59e0b" />,bg: '#f59e0b20', value: stats.totalOrders,    label: 'Total Orders'   },
    { icon: <TrendingUp size={20} color="#8b5cf6" />,  bg: '#8b5cf620', value: formatCurrency(stats.totalRevenue), label: 'Revenue' },
    { icon: <AlertCircle size={20} color="#ef4444" />, bg: '#ef444420', value: stats.outOfStock,     label: 'Out of Stock'   },
    { icon: <AlertTriangle size={20} color="#f59e0b" />, bg: '#fde68a50', value: stats.lowStock,     label: 'Low Stock'      },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-['DM_Sans',sans-serif] text-[#111827] p-0">
      {/* ── Header + Stats ─────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-[26px] font-bold text-[#111827] m-0 mb-1 tracking-[-0.3px]">
          Product Inventory
        </h1>
        <p className="text-[14px] text-[#6b7280] m-0 mb-6">
          Manage your products and track performance
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {STAT_CARDS.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-[12px] p-5 flex items-center gap-3.5 shadow-sm border border-[#e5e7eb] transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.bg }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[22px] font-bold text-[#111827] leading-tight truncate">
                  {s.value}
                </div>
                <div className="text-[12px] text-[#9ca3af] mt-0.5 font-medium uppercase tracking-[0.5px]">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] shadow-sm border border-[#e5e7eb] overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 pt-6 border-b border-[#f3f4f6]">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-[#111827] m-0 mb-0.5">Products</h2>
              <p className="text-[13px] text-[#6b7280] m-0">
                Manage your product listings and inventory
              </p>
            </div>
            <div className="flex gap-2.5 items-center">
              <button
                onClick={() => router.push('/bulk')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent text-[#111827] border-[1.5px] border-[#e5e7eb] rounded-[8px] text-[14px] font-semibold cursor-pointer transition-colors hover:border-[#4f6ef7] hover:bg-[#f0f3ff]"
              >
                <Upload size={16} /> Bulk Upload
              </button>
              <button
                onClick={() => router.push('/add-product')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1d27] text-white border-none rounded-[8px] text-[14px] font-semibold cursor-pointer transition-colors hover:bg-[#252838]"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pb-5">
            <div className="relative flex items-center flex-1 min-w-[240px] max-w-[480px]">
              <Search size={18} className="absolute left-3 text-[#9ca3af] pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border-[1.5px] border-[#e5e7eb] rounded-[8px] text-[14px] text-[#111827] bg-[#f4f5f7] outline-none transition-colors focus:border-[#4f6ef7] focus:bg-white placeholder:text-[#9ca3af]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1.5 px-3 py-1 bg-[#4f6ef7] text-white border-none rounded-[6px] text-[13px] font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 pr-8 border-[1.5px] border-[#e5e7eb] rounded-[8px] text-[14px] text-[#111827] bg-[#f4f5f7] outline-none appearance-none cursor-pointer transition-colors focus:border-[#4f6ef7]"
              >
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
                <option value="deleted">Deleted</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock (≤5)</option>
              </select>

              {selectedProducts.length > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff6ff] text-[#4f6ef7] border-[1.5px] border-[#bfdbfe] rounded-[8px] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#dbeafe]"
                  >
                    <Edit3 size={16} /> Edit ({selectedProducts.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#fef2f2] text-[#ef4444] border-[1.5px] border-[#fecaca] rounded-[8px] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#fee2e2]"
                  >
                    <Trash2 size={16} /> Delete ({selectedProducts.length})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <ProductTable
          products={products}
          loading={loading}
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onAnalytics={handleAnalytics}
          onDelete={handleDelete}
          onHardDelete={handleHardDelete}        // NEW
          onDuplicate={handleDuplicate}
          onRestore={handleRestore}
          showActions={showActions}
          setShowActions={setShowActions}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          formatCurrency={formatCurrency}
          filterStatus={filterStatus}
          deleteLoading={deleteProductMutation.isPending}
          duplicateLoading={duplicateProductMutation.isPending}
          hardDeleteLoading={hardDeleteMutation.isPending}  // NEW
        />
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <BulkEditModal
          isOpen={showBulkEditModal}
          selectedProductIds={selectedProducts}
          categories={[]}
          onClose={() => setShowBulkEditModal(false)}
          onSave={handleBulkEditSubmit}
        />
      )}
    </div>
  );
};

export default ProductInventory;