"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitReviewSchema, type SubmitReviewPayload } from "@/app/features/buyer/schemas/review-buyer.schema";
import { useSubmitReview, useProductForReview } from "@/app/features/buyer/hooks/use-review-buyer";
import { StarRating } from "@/app/components/ui/star-rating";
import { Loader2, Send, Lock, CheckCircle2 } from "lucide-react";

interface BuyerReviewFormProps {
  productId: string;
  orderId: string;
  defaultEmail?: string;
  defaultName?: string;
  onSuccess?: () => void;
}

export function BuyerReviewForm({
  productId,
  orderId,
  defaultEmail,
  defaultName,
  onSuccess,
}: BuyerReviewFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Single API call fetches product snapshot, customer info AND eligibility
  const { data: reviewData, isLoading } = useProductForReview(productId, orderId);
  const { mutate: submitReview, isPending } = useSubmitReview();

  const activeEmail = defaultEmail || reviewData?.customerEmail || "";
  const activeName = defaultName || reviewData?.customerName || "";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SubmitReviewPayload>({
    resolver: zodResolver(SubmitReviewSchema),
    defaultValues: {
      productId,
      orderId,
      email: activeEmail,
      userName: activeName,
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    if (activeEmail || activeName) {
      reset((prev) => ({
        ...prev,
        productId,
        orderId,
        email: activeEmail,
        userName: activeName,
      }));
    }
  }, [activeEmail, activeName, productId, orderId, reset]);

  const onSubmit = (data: SubmitReviewPayload) => {
    submitReview(data, {
      onSuccess: () => {
        setIsSubmitted(true);
        onSuccess?.();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-44 items-center justify-center rounded-2xl border border-[#E5D9CC] bg-[#FDFBF7]">
        <Loader2 className="h-6 w-6 animate-spin text-[#8C6D53]" />
      </div>
    );
  }

  // Real-World UI: Form is replaced immediately if already reviewed or submitted
  if (isSubmitted || reviewData?.alreadyReviewed || reviewData?.canReview === false) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold text-emerald-900">
          {isSubmitted ? "Review Submitted!" : "Review Already Received"}
        </h3>
        <p className="mt-1 text-sm text-emerald-700">
          {isSubmitted
            ? "Thank you for sharing your feedback!"
            : "You have already submitted a review for this order."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5D9CC] bg-[#FDFBF7] p-6 shadow-sm sm:p-8">
      <div className="mb-6 border-b border-[#E5D9CC] pb-4">
        <h3 className="text-xl font-semibold text-[#5A4332]">Write a Review</h3>
        <p className="text-sm text-[#8C7462]">
          Share your experience with this product to help other buyers.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#5A4332]">Overall Rating</label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating value={field.value} onChange={field.onChange} size={28} />
            )}
          />
          {errors.rating && (
            <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5A4332]">Your Name</label>
            <input
              type="text"
              {...register("userName")}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-[#E5D9CC] bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-[#8C6D53] focus:ring-2 focus:ring-[#8C6D53]/20"
            />
            {errors.userName && (
              <p className="mt-1 text-xs text-red-600">{errors.userName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#5A4332]">
              Email Address <span className="text-xs text-stone-400">(Verified Order Email)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                readOnly
                className="w-full rounded-lg border border-[#E5D9CC] bg-stone-100 px-3.5 py-2.5 text-sm text-stone-500 outline-none cursor-not-allowed pr-9"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-stone-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#5A4332]">Your Review</label>
          <textarea
            rows={4}
            {...register("comment")}
            placeholder="What did you like or dislike about this item?"
            className="w-full rounded-lg border border-[#E5D9CC] bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-[#8C6D53] focus:ring-2 focus:ring-[#8C6D53]/20"
          />
          {errors.comment && (
            <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8C6D53] px-6 py-3 text-sm font-medium text-white shadow transition hover:bg-[#735741] focus:outline-none focus:ring-2 focus:ring-[#8C6D53] focus:ring-offset-2 disabled:opacity-60 sm:w-auto cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}