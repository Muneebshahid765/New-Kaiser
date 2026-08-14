// features/products/api/product.api.ts
import {  get } from '@/services/https';

import type {

  FeaturedProductsResponse,
  FilteredProductsResponse,
  GetProductsFilterParams,
  SimilarProductsResponse,
  GetPublicProductDetailResponse,
} from '../types/product-response.types';

// ─── Image URL helper ─────────────────────────────────────────────────────────
export function buildImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`;
}


export const getFeaturedProducts = () =>
  get<FeaturedProductsResponse>("/public-products/featured-products");

export const getFilteredProducts = (params: GetProductsFilterParams = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return get<FilteredProductsResponse>(
    `/public-products${queryString ? `?${queryString}` : ""}`
  );
};

// features/products/api/product.api.ts — add karo
export const getSimilarProducts = (productId: string, categoryId: string) =>
  get<SimilarProductsResponse>(`/public-products/${productId}/similar`, {
    params: { categoryId },
  })

// features/products/api/product.api.ts

export const getPublicProductDetail = (param: string) =>
  get<GetPublicProductDetailResponse>(`/public-products/detail/${param}`);
