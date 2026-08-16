import { ReviewStatus } from "../schemas/review-admin.schema";

export interface AdminReviewItem {
  id: string;
  productId: string;
  orderId: string;
  buyerProfileId?: string | null;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  productName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewsListResponse {
  success: boolean;
  reviews: AdminReviewItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface UpdateReviewStatusResponse {
  success: boolean;
  message: string;
  review: AdminReviewItem;
}

export interface AdminGenericActionResponse {
  success: boolean;
  message: string;
}