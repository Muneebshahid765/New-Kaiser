// features/products/hooks/useProductInventory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useInventory,
  useDeleteProduct,
  useDuplicateProduct,
  useRestoreProduct,
  useBulkUpdateProducts,
  useHardDeleteProduct,          // NEW
} from '@/app/features/products/hooks/product.hooks';
import type { InventoryProductItem } from '@/app/features/products/types/product-response.types';

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalOrders: number;
  totalRevenue: number;
  outOfStock: number;
  lowStock: number;
}

export const useProductInventory = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('inv_filter') || 'all'
      : 'all',
  );
  const [showActions, setShowActions] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(() =>
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('inv_page') || '1', 10)
      : 1,
  );
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query params
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: 10,
      search: debouncedSearch,
      ...(filterStatus !== 'all' ? { status: filterStatus } : {}),
    }),
    [currentPage, debouncedSearch, filterStatus],
  );

  const { data, isLoading, isFetching, error, refetch } = useInventory(queryParams);

  // Mutations
  const deleteProductMutation     = useDeleteProduct();
  const duplicateProductMutation  = useDuplicateProduct();
  const restoreProductMutation    = useRestoreProduct();
  const bulkUpdateMutation        = useBulkUpdateProducts();
  const hardDeleteMutation        = useHardDeleteProduct();  // NEW

  const products = data?.products || [];
  const pagination = data?.pagination || {
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedProducts([]);
    if (typeof window !== 'undefined') localStorage.setItem('inv_page', String(page));
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    setFilterStatus(filter);
    setCurrentPage(1);
    setSelectedProducts([]);
    if (typeof window !== 'undefined') localStorage.setItem('inv_filter', filter);
  }, []);

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedProducts((prev) =>
      prev.length === products.length ? [] : products.map((p) => p.id),
    );
  }, [products]);

  const stats = useMemo<ProductStats>(() => ({
    totalProducts:  pagination.totalProducts || 0,
    activeProducts: products.filter((p) => p.status === 'active').length,
    draftProducts:  products.filter((p) => p.status !== 'active').length,
    totalOrders:    0,
    totalRevenue:   0,
    outOfStock:     products.filter((p) => !p.stockQuantity || p.stockQuantity === 0).length,
    lowStock:       products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length,
  }), [products, pagination.totalProducts]);

  const formatCurrency = useCallback(
    (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0),
    [],
  );

  return {
    products,
    loading: isLoading || isFetching,
    error,
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
    refetch,
    handlePageChange,
    handleFilterChange,
    handleSelectProduct,
    handleSelectAll,
    setSelectedProducts,

    // Mutations
    deleteProductMutation,
    duplicateProductMutation,
    restoreProductMutation,
    bulkUpdateMutation,
    hardDeleteMutation,             // NEW
  };
};