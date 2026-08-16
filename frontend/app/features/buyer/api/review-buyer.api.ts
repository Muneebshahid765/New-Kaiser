import { get, post } from "@/services/https";
import type {
  SubmitReviewPayload,
  CanReviewPayload,
  QueryProductReviewsPayload,
} from "../schemas/review-buyer.schema";
import type {
  SubmitReviewResponse,
  ProductReviewsResponse,
  ProductForReviewResponse,
  CanReviewResponse,
} from "../types/review-buyer-response.types";

export const submitReview = (dto: SubmitReviewPayload) =>
  post<SubmitReviewResponse>("/buyer/reviews/submit", dto);

export const getProductReviews = (slugOrId: string, params?: QueryProductReviewsPayload) =>
  get<ProductReviewsResponse>(`/buyer/reviews/product/${slugOrId}`, { params });

export const getProductForReview = (slugOrId: string, orderId?: string) =>
  get<ProductForReviewResponse>(`/buyer/reviews/product-for-review/${slugOrId}`, {
    params: orderId ? { orderId } : undefined,
  });

export const canReview = (dto: CanReviewPayload) =>
  post<CanReviewResponse>("/buyer/reviews/can-review", dto);