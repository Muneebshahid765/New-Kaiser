// features/products/hooks/product.hooks.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutationWithToast } from '@/hooks/use-mutation-toast';
import {
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  duplicateProduct,
  getFeaturedProducts,
  getFilteredProducts,
  getInventory,
  getProduct,
  getPublicProductDetail,
  getSimilarProducts,
  hardDeleteProduct,
  restoreProduct,
  updateProduct,
} from '../api/product.api';
import type {
  BulkUpdateProductPayload,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/product.types';
import type {
  Product,
  GetProductResponse,
  UpdateProductResponse,
  SoftDeleteResponse,
  RestoreProductResponse,
  DuplicateProductResponse,
  BulkUpdateResponse,
  InventoryResponse,
  HardDeleteResponse,
  FeaturedProductItem,
  GetProductsFilterParams,
  FilteredProductsResponse,
  SimilarProductsResponse,
  GetPublicProductDetailResponse,
} from '../types/product-response.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
const PRODUCT_INVENTORY_ROOT = ['products', 'inventory'] as const;
export const PRODUCTS_FEATURED_KEY = ['products', 'featured'] as const;

export const PRODUCT_INVENTORY_KEY = (query: Record<string, unknown>) =>
  [...PRODUCT_INVENTORY_ROOT, query] as const;

export const PRODUCT_DETAIL_KEY = (param: string) =>
  ['products', 'detail', param] as const;


export const PRODUCTS_QUERY_KEY = (params: GetProductsFilterParams) => [
  "products",
  "list",
  params,
];

export const SIMILAR_PRODUCTS_KEY = (productId: string) =>
  ['products', 'similar', productId] as const


export function usePublicProducts(params: GetProductsFilterParams = {}) {
  return useQuery<FilteredProductsResponse, Error>({
    queryKey: PRODUCTS_QUERY_KEY(params),
    queryFn: () => getFilteredProducts(params),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
    placeholderData: (previousData) => previousData, // Smooth page/filter transitions
  });
}


export function useFeaturedProducts() {
  return useQuery({
    queryKey: PRODUCTS_FEATURED_KEY,
    queryFn: async () => {
      const res = await getFeaturedProducts();
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour memory persistence
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}

export function usePublicProductDetail(param: string) {
  return useQuery<GetPublicProductDetailResponse, Error>({
    queryKey: PRODUCT_DETAIL_KEY(param),
    queryFn: () => getPublicProductDetail(param),
    enabled: Boolean(param?.trim()), // Param na ho to execution block karein
    staleTime: 1000 * 60 * 5,       // 5 Minutes memory cache
    retry: false,
  });
}

export function useProduct(param: string) {
  return useQuery<GetProductResponse, Error>({
    queryKey: PRODUCT_DETAIL_KEY(param),
    queryFn: () => getProduct(param),
    enabled: !!param,
    staleTime: 1_000 * 60 * 5,
    retry: false,
  });
}

// ─── Inventory list ───────────────────────────────────────────────────────────
export function useInventory(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery<InventoryResponse, Error>({
    queryKey: PRODUCT_INVENTORY_KEY(query),
    queryFn: () => getInventory(query),
    staleTime: 1_000 * 60 * 2,
    retry: false,
  });
}



export function useSimilarProducts(productId: string, categoryId: string) {
  return useQuery<SimilarProductsResponse, Error>({
    queryKey: SIMILAR_PRODUCTS_KEY(productId),
    queryFn:  () => getSimilarProducts(productId, categoryId),
    enabled:  Boolean(productId && categoryId),   // dono ho tab hi fetch karo
    staleTime: 1_000 * 60 * 5,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutationWithToast<Product, CreateProductPayload>(createProduct, {
    successMsg: 'Product created successfully.',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutationWithToast<
    UpdateProductResponse,
    { id: string; payload: UpdateProductPayload }
  >(updateProduct, {
    successMsg: 'Product updated successfully.',
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT });
      queryClient.invalidateQueries({ queryKey: PRODUCT_DETAIL_KEY(variables.id) });
    },
  });
}

// ─── Bulk Update ──────────────────────────────────────────────────────────────
export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();
  return useMutationWithToast<BulkUpdateResponse, BulkUpdateProductPayload>(
    bulkUpdateProducts,
    {
      successMsg: 'Products updated successfully.',
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT }),
    },
  );
}

// ─── Duplicate ────────────────────────────────────────────────────────────────
export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  return useMutationWithToast<DuplicateProductResponse, string>(
    duplicateProduct,
    {
      successMsg: 'Product duplicated successfully.',
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT }),
    },
  );
}

// ─── Soft Delete ──────────────────────────────────────────────────────────────
// deleted: true, status: archived — restorable
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutationWithToast<SoftDeleteResponse, string>(deleteProduct, {
    successMsg: 'Product deleted. You can restore it from the Deleted filter.',
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT }),
  });
}

// ─── Restore ──────────────────────────────────────────────────────────────────
// deleted: false, status: draft
export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutationWithToast<RestoreProductResponse, string>(restoreProduct, {
    successMsg: 'Product restored. Status set to Draft — activate when ready.',
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT }),
  });
}

// ─── Hard Delete ──────────────────────────────────────────────────────────────
// Permanently removes product + disk images — irreversible
// Backend blocks this if any orders exist
export function useHardDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutationWithToast<HardDeleteResponse, string>(hardDeleteProduct, {
    successMsg: 'Product permanently deleted.',
    errorMsg: 'Cannot delete: product has associated orders.',
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_INVENTORY_ROOT }),
  });
}