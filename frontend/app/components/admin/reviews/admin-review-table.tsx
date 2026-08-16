"use client";

import { useState } from "react";
import {
  useAdminReviews,
  useUpdateReviewStatus,
  useDeleteReview,
  useTestReminderEmail,
} from "@/app/features/admin/hooks/use-review-admin";
import type { ReviewStatus } from "@/app/features/admin/schemas/review-admin.schema";
import { StarRating } from "../../ui/star-rating";
import { Loader2, CheckCircle2, XCircle, Trash2, Mail, Search } from "lucide-react";

export function AdminReviewTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useAdminReviews({ page, limit: 10, status: statusFilter, search });
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReviewStatus();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const { mutate: sendTestReminder, isPending: isSendingReminder } = useTestReminderEmail();

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by user or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-stone-400"
          />
        </div>

        <select
          value={statusFilter || ""}
          onChange={(e) =>
            setStatusFilter(e.target.value ? (e.target.value as ReviewStatus) : undefined)
          }
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data?.reviews.map((review) => (
                <tr key={review.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-medium text-stone-900">{review.productName}</td>
                  <td className="px-4 py-3">
                    <div>{review.userName}</div>
                    <div className="text-xs text-stone-400">{review.userEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating value={review.rating} readOnly size={14} />
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600">{review.comment}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        review.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : review.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {review.status !== "approved" && (
                      <button
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus({ reviewId: review.id, dto: { status: "approved" } })
                        }
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                        title="Approve"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus({ reviewId: review.id, dto: { status: "rejected" } })
                        }
                        className="rounded p-1 text-amber-600 hover:bg-amber-50"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      disabled={isSendingReminder}
                      onClick={() => sendTestReminder(review.orderId)}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50"
                      title="Send Test Reminder Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      disabled={isDeleting}
                      onClick={() => deleteReview(review.id)}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}