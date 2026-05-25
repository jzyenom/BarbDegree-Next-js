"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  formatAdminDate,
} from "@/components/admin/AdminPageShell";

type UserSummary = {
  name?: string;
  email?: string;
};

type ReviewBarber = {
  userId?: UserSummary;
};

type ReviewBooking = {
  service?: string;
  dateTime?: string;
};

type AdminReview = {
  _id: string;
  rate: number;
  comment?: string;
  createdAt?: string;
  userId?: UserSummary | string | null;
  barberId?: ReviewBarber | string | null;
  bookingId?: ReviewBooking | string | null;
};

type ReviewsResponse = {
  reviews?: AdminReview[];
  error?: string;
};

function displayUser(user?: UserSummary | string | null) {
  if (!user) return "Unknown";
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown";
}

function displayBarber(barber?: ReviewBarber | string | null) {
  if (!barber) return "Unknown";
  if (typeof barber === "string") return barber;
  return barber.userId?.name || barber.userId?.email || "Unknown";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    query.set("limit", "300");

    try {
      const res = await fetch(`/api/admin/reviews?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ReviewsResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load reviews");
      setReviews(json.reviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadReviews();
  }

  return (
    <AdminPageShell
      title="Reviews"
      subtitle="Review customer feedback attached to completed paid bookings."
    >
      <section className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto]"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search review text"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
          />
          <button className="h-11 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
            Apply
          </button>
        </form>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          // show text
          <p className="text-sm text-slate-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <AdminEmptyState>No reviews found.</AdminEmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.map((review) => (
              // show article
              <article
                key={review._id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* show text */}
                    <p className="text-lg font-bold text-[#f2800d]">
                      {review.rate}/5
                    </p>
                    {/* show text */}
                    <p className="mt-1 text-sm text-slate-600">
                      {formatAdminDate(review.createdAt)}
                    </p>
                  </div>
                  {/* show text */}
                  <p className="text-right text-sm text-slate-600">
                    {displayUser(review.userId)} to {displayBarber(review.barberId)}
                  </p>
                </div>
                {/* show text */}
                <p className="mt-4 text-sm text-slate-800">
                  {review.comment || "No comment"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
