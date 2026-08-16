import { AdminReviewTable } from "@/app/components/admin/reviews/admin-review-table";

export default function AdminReviewsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Review Moderation</h1>
        <p className="text-sm text-stone-500">Manage customer reviews and feedback status.</p>
      </div>

      <AdminReviewTable />
    </div>
  );
}