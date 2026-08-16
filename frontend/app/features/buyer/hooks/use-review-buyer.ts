import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import {
  submitReview,
  getProductReviews,
  getProductForReview,
  canReview,
} from "../api/review-buyer.api";
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

export const BUYER_REVIEWS_KEY = ["buyer", "reviews"] as const;

export function useProductReviews(slugOrId: string, queryParams?: QueryProductReviewsPayload) {
  return useQuery<ProductReviewsResponse, Error>({
    queryKey: [...BUYER_REVIEWS_KEY, "product", slugOrId, queryParams],
    queryFn: async () => {
      const res = await getProductReviews(slugOrId, queryParams);
      return {
        data: res?.data || [],
        meta: res?.meta || { nextCursor: null, hasMore: false, limit: 5 },
      };
    },
    enabled: !!slugOrId,
    staleTime: 1000 * 60 * 3,
  });
}

export function useProductForReview(slugOrId: string, orderId?: string) {
  return useQuery<ProductForReviewResponse, Error>({
    queryKey: [...BUYER_REVIEWS_KEY, "product-for-review", slugOrId, orderId],
    queryFn: () => getProductForReview(slugOrId, orderId),
    enabled: !!slugOrId,
  });
}

export function useCanReview(dto: CanReviewPayload, enabled = true) {
  return useQuery<CanReviewResponse, Error>({
    queryKey: [...BUYER_REVIEWS_KEY, "can-review", dto.productId, dto.email, dto.orderId],
    queryFn: () => canReview(dto),
    enabled: enabled && !!dto.productId && !!dto.email,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutationWithToast<SubmitReviewResponse, SubmitReviewPayload>(submitReview, {
    successMsg: "Shukriya! Aapka review submit ho gaya hai.",
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...BUYER_REVIEWS_KEY, "product", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: [...BUYER_REVIEWS_KEY, "can-review"] });
    },
  });
}