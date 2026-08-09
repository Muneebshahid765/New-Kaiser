// features/products/api/product.api.ts
import { del, get, patch, post, put } from '@/services/https';
import type {
  BulkUpdateProductPayload,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/product.types';
import type {
  Product,
  GetProductResponse,
  UpdateProductResponse,
  CreateProductResponseRaw,
  InventoryResponse,
  BulkUpdateResponse,
  DuplicateProductResponse,
  SoftDeleteResponse,
  RestoreProductResponse,
  HardDeleteResponse,
  FeaturedProductsResponse,
} from '../types/product-response.types';

// ─── Image URL helper ─────────────────────────────────────────────────────────
export function buildImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`;
}

// ─── Create ───────────────────────────────────────────────────────────────────
export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await post<CreateProductResponseRaw>('/products/create', payload);
  const nested = res.product as unknown;
  if (nested && typeof nested === 'object' && 'product' in (nested as object)) {
    return (nested as { product: Product }).product;
  }
  return nested as Product;
};

// ─── Get one (public, by id or slug) ─────────────────────────────────────────
export const getProduct = (param: string) =>
  get<GetProductResponse>(`/products/${param}`);

// ─── Update (admin) ───────────────────────────────────────────────────────────
export const updateProduct = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateProductPayload;
}) => put<UpdateProductResponse>(`/products/admin/${id}`, payload);

// ─── Inventory list ───────────────────────────────────────────────────────────
export const getInventory = (query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => get<InventoryResponse>('/products/inventory', { params: query });

// ─── Bulk Update ──────────────────────────────────────────────────────────────
export const bulkUpdateProducts = (payload: BulkUpdateProductPayload) =>
  patch<BulkUpdateResponse>('/products/bulk-update', payload);

// ─── Duplicate ────────────────────────────────────────────────────────────────
export const duplicateProduct = (id: string) =>
  post<DuplicateProductResponse>(`/products/${id}/duplicate`);

// ─── Soft Delete ──────────────────────────────────────────────────────────────
// Sets deleted: true, status: archived — restorable
// Endpoint: DELETE /admin/products/:id/soft
export const deleteProduct = (id: string) =>
  del<SoftDeleteResponse>(`/products/admin/${id}/soft`);

// ─── Restore ──────────────────────────────────────────────────────────────────
// Clears deleted flag, sets status: draft
// Endpoint: PATCH /admin/products/:id/restore
export const restoreProduct = (id: string) =>
  patch<RestoreProductResponse>(`/products/admin/${id}/restore`);

// ─── Hard Delete ──────────────────────────────────────────────────────────────
// Permanently removes product + images from disk + DB
// Only allowed when orderItem count === 0
// Endpoint: DELETE /admin/products/:id/hard
export const hardDeleteProduct = (id: string) =>
  del<HardDeleteResponse>(`/products/admin/${id}/hard`);

// features/products/api/product.api.ts (addition)
export const getFeaturedProducts = () =>
  get<FeaturedProductsResponse>("/products/featured-products");