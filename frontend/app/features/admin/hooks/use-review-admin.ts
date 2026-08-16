import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import {
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
  testReminderEmail,
} from "../api/review-admin.api";
import type {
  QueryAdminReviewsPayload,
  UpdateReviewStatusPayload,
} from "../schemas/review-admin.schema";
import type {
  AdminReviewsListResponse,
  UpdateReviewStatusResponse,
  AdminGenericActionResponse,
} from "../types/review-admin-response.types";

export const ADMIN_REVIEWS_KEY = ["admin", "reviews"] as const;

export function useAdminReviews(queryParams?: QueryAdminReviewsPayload) {
  return useQuery<AdminReviewsListResponse, Error>({
    queryKey: [...ADMIN_REVIEWS_KEY, queryParams],
    queryFn: () => getAllReviewsAdmin(queryParams),
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutationWithToast<
    UpdateReviewStatusResponse,
    { reviewId: string; dto: UpdateReviewStatusPayload }
  >(updateReviewStatus, {
    successMsg: "Review status update ho gaya.",
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_KEY }),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutationWithToast<AdminGenericActionResponse, string>(deleteReview, {
    successMsg: "Review delete ho gaya.",
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_KEY }),
  });
}

export function useTestReminderEmail() {
  return useMutationWithToast<AdminGenericActionResponse, string>(testReminderEmail, {
    successMsg: "Test review reminder email send ho gai.",
  });
}