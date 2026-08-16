import { get, patch, del, post } from "@/services/https";
import type {
  QueryAdminReviewsPayload,
  UpdateReviewStatusPayload,
} from "../schemas/review-admin.schema";
import type {
  AdminReviewsListResponse,
  UpdateReviewStatusResponse,
  AdminGenericActionResponse,
} from "../types/review-admin-response.types";

export const getAllReviewsAdmin = (params?: QueryAdminReviewsPayload) =>
  get<AdminReviewsListResponse>("/admin/reviews/all", { params });

export const updateReviewStatus = ({
  reviewId,
  dto,
}: {
  reviewId: string;
  dto: UpdateReviewStatusPayload;
}) => patch<UpdateReviewStatusResponse>(`/admin/reviews/${reviewId}/status`, dto);

export const deleteReview = (reviewId: string) =>
  del<AdminGenericActionResponse>(`/admin/reviews/${reviewId}`);

export const testReminderEmail = (orderId: string) =>
  post<AdminGenericActionResponse>(`/admin/reviews/test-reminder/${orderId}`, {});