// features/products/types/product-response.types.ts
// ─── Existing types unchanged — HardDeleteResponse added at bottom ────────────

export type LabelVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'purple'
  | 'green'
  | 'blue'
  | 'orange';

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductImageItem {
  id: string;
  productId: string;
  imageId: string;
  url: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProductLabel {
  id: string;
  productId: string;
  text: string;
  variant: LabelVariant;
  sortOrder: number;
}

export interface ProductIngredient {
  id: string;
  productId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface ProductNutritionFact {
  id: string;
  productId: string;
  name: string;
  value: string;
  unit: string;
  description: string;
  sortOrder: number;
}

export interface ProductBenefit {
  id: string;
  productId: string;
  title: string;
  description: string;
  icon: string;
  learnMoreUrl: string;
  sortOrder: number;
}

export interface ProductFaq {
  id: string;
  productId: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface ProductStatHighlight {
  id: string;
  productId: string;
  label: string;
  value: string;
  description: string;
  sortOrder: number;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  originalPrice: number | null;
  categoryId: string;
  category: ProductCategoryRef;
  features: string[];
  highlights: string[];
  sharedFeatures: string[];
  deliveryCharges: number;
  deliveryRule: string;
  insuranceDetails: string;
  usageInstructions: string;
  stockQuantity: number;
  specifications: Record<string, unknown>;
  status: ProductStatus;
  deleted: boolean;
  deletedAt: string | null;
  averageRating: number;
  totalReviews: number;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  images: ProductImageItem[];
  labels: ProductLabel[];
  ingredients: ProductIngredient[];
  nutritionFacts: ProductNutritionFact[];
  benefits: ProductBenefit[];
  faqs: ProductFaq[];
  statHighlights: ProductStatHighlight[];
}

export interface PublicProductView
  extends Omit<
    Product,
    | 'labels'
    | 'ingredients'
    | 'nutritionFacts'
    | 'benefits'
    | 'faqs'
    | 'statHighlights'
    | 'adminNotes'
    | 'deleted'
    | 'deletedAt'
  > {
  finalPrice?: number;
  discountPercentage?: number;
}

export interface GetProductResponse {
  success: boolean;
  product: PublicProductView;
}

export interface UpdateProductResponse {
  success: boolean;
  message: string;
  product: Product;
}

export interface CreateProductResponseRaw {
  success: boolean;
  message: string;
  product: {
    success: boolean;
    message: string;
    product: Product;
  };
}

export interface ProductScalar {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  originalPrice: number | null;
  categoryId: string;
  features: string[];
  highlights: string[];
  sharedFeatures: string[];
  deliveryCharges: number;
  deliveryRule: string;
  insuranceDetails: string;
  usageInstructions: string;
  stockQuantity: number;
  specifications: Record<string, unknown>;
  status: ProductStatus;
  deleted: boolean;
  deletedAt: string | null;
  averageRating: number;
  totalReviews: number;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryProductItem extends ProductScalar {
  _id: string; // legacy Mongo-compat dupe of `id`
  category: ProductCategoryRef;
  images: Pick<ProductImageItem, 'id' | 'url'>[]; // take: 1
  labels: ProductLabel[];
}

export interface InventoryPagination {
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface InventoryResponse {
  success: boolean;
  products: InventoryProductItem[];
  pagination: InventoryPagination;
}

export interface BulkUpdateResponse {
  success: boolean;
  warning?: boolean;
  message: string;
  matchedCount?: number;
  modifiedCount?: number;
  skippedCount?: number;
}

export interface DuplicateProductResponse {
  success: boolean;
  message: string;
  product: ProductScalar & { _id: string };
}

// Soft delete — deleted flag set, images retained
export interface SoftDeleteResponse {
  success: boolean;
  message: string;
  productId: string;
}

// Restore — draft status, deleted flag cleared
export interface RestoreProductResponse {
  success: boolean;
  message: string;
  product: Pick<ProductScalar, 'id' | 'slug' | 'status'>;
}

// Hard delete — permanently removed from DB + images deleted from disk
export interface HardDeleteResponse {
  success: boolean;
  message: string;
  productId: string;
}

// features/products/types/product-response.types.ts (additions)

export interface FeaturedProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  averageRating: number;
  totalReviews: number;
  features: string[];
  highlights: string[];
  createdAt: string;
  category: ProductCategoryRef;
  images: Pick<ProductImageItem, 'url' | 'title'>[];
  labels: Pick<ProductLabel, 'text' | 'variant'>[];
  // calculateGlobalDiscount se
  finalPrice?: number;
  discountPercentage?: number;
}

export interface FeaturedProductsResponse {
  success: boolean;
  data: FeaturedProductItem[];
}


// ─── Filter Query Parameters ──────────────────────────────────────────────────

export interface GetProductsFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  stockFilter?: string; // 'instock' | 'outofstock' | 'lowstock'
  onSale?: boolean | string;
  minRating?: string;
  sort?: string;
}

// ─── Filtered Product Item (Public Grid / Catalog) ───────────────────────────

export interface FilteredProductItem {
  id: string;
  _id?: string; // Legacy UI compatibility
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  category: ProductCategoryRef;
  images: Pick<ProductImageItem, 'url' | 'title'>[];
  labels: Pick<ProductLabel, 'text' | 'variant'>[];
  finalPrice?: number;
  discountPercentage?: number;
}

export interface ProductsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilteredProductsResponse {
  success: boolean;
  products: FilteredProductItem[];
  pagination: ProductsPagination;
}

export interface SimilarProductsResponse {
  success:  boolean
  products: FilteredProductItem[]  
  total:    number
}


// ─── Detailed Public Product Sub-Interfaces ──────────────────────────────────

export interface DetailedProductImage {
  url: string;
  title: string;
  sortOrder: number;
}

export interface DetailedProductLabel {
  text: string;
  variant: LabelVariant;
  sortOrder: number;
}

export interface DetailedPackageContent {
  name: string;
  description: string;
  sortOrder: number;
}

export interface DetailedProductAttribute {
  name: string;
  value: string;
  unit: string;
  sortOrder: number;
}

export interface DetailedProductBenefit {
  title: string;
  description: string;
  icon: string;
  learnMoreUrl: string;
  sortOrder: number;
}

export interface DetailedProductFaq {
  question: string;
  answer: string;
  sortOrder: number;
}

// ─── Main Public Product Detail Object ───────────────────────────────────────

export interface PublicProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  averageRating: number;
  totalReviews: number;
  deliveryCharges: number;
  deliveryRule: string;
  insuranceDetails: string;
  usageInstructions: string;
  features: string[];
  highlights: string[];
  specifications: Record<string, unknown>;
  categoryId: string;
  category: ProductCategoryRef;
  images: DetailedProductImage[];
  labels: DetailedProductLabel[];
  packageContents: DetailedPackageContent[];
  attributes: DetailedProductAttribute[];
  benefits: DetailedProductBenefit[];
  faqs: DetailedProductFaq[];
  appliedDiscount?: number;
  finalPrice?: number;
  discountPercentage?: number;
}

// ─── Reviews Sub-Types ────────────────────────────────────────────────────────

export interface ProductReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerProfile?: {
    id: string;
  };
}

export interface ProductReviewsMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface ProductReviewsPayload {
  data: ProductReviewItem[];
  meta: ProductReviewsMeta;
}

// ─── Complete Endpoint Response ─────────────────────────────────────────────

export interface GetPublicProductDetailResponse {
  success: boolean;
  product: PublicProductDetail;
  reviews: ProductReviewsPayload;
  similar: SimilarProductsResponse;
}