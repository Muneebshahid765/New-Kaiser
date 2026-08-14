
// features/products/hooks/product.hooks.ts
import { useQuery } from '@tanstack/react-query';

import type {

  GetProductsFilterParams,
  FilteredProductsResponse,
  SimilarProductsResponse,
  GetPublicProductDetailResponse,
} from '../types/product-response.types';
import { getFeaturedProducts, getFilteredProducts, getPublicProductDetail, getSimilarProducts } from '../api/public-product.api';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const PRODUCTS_FEATURED_KEY = ['products', 'featured'] as const;
export const PRODUCTS_QUERY_KEY = (params: GetProductsFilterParams) => [
  "products",
  "list",
  params,
];

export const SIMILAR_PRODUCTS_KEY = (productId: string) =>
  ['products', 'similar', productId] as const

export const PRODUCT_DETAIL_KEY = (param: string) =>
  ['products', 'detail', param] as const;


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


export function useSimilarProducts(productId: string, categoryId: string) {
  return useQuery<SimilarProductsResponse, Error>({
    queryKey: SIMILAR_PRODUCTS_KEY(productId),
    queryFn:  () => getSimilarProducts(productId, categoryId),
    enabled:  Boolean(productId && categoryId),   // dono ho tab hi fetch karo
    staleTime: 1_000 * 60 * 5,
  })
}