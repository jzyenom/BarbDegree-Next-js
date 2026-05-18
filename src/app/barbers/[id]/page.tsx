"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import HeaderBack from "@/components/ui/HeaderBack";

type ServiceItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
};

type EligibleBooking = {
  _id: string;
  service: string;
  services?: { name: string }[];
  dateTime: string;
  status?: string;
};

type BarberProfile = {
  _id: string;
  name: string;
  avatar: string;
  bio?: string;
  exp?: string;
  location?: string;
  shopName?: string;
  rating?: number | null;
  reviews: number;
  reputationScore: number;
  badges: string[];
  completedJobs: number;
  bookable: boolean;
  services: ServiceItem[];
  recentReviews?: {
    _id: string;
    rate: number;
    comment?: string;
    createdAt: string;
    userId?: { name?: string };
  }[];
};

export default function PublicBarberProfilePage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: session, status } = useSession();
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  const isClient = session?.user?.role === "client";
  const canRate = isClient && eligibleBookings.length > 0;

  const selectedBooking = useMemo(
    () => eligibleBookings.find((booking) => booking._id === selectedBookingId),
    [eligibleBookings, selectedBookingId]
  );

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/barbers/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load barber");
        setBarber(json.barber);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load barber");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  useEffect(() => {
    if (!id || status === "loading" || !isClient) {
      setEligibleBookings([]);
      return;
    }

    const loadEligibility = async () => {
      const res = await fetch(`/api/barbers/${id}/rating-eligibility`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.bookings)) {
        setEligibleBookings(json.bookings);
        setSelectedBookingId(json.bookings[0]?._id ?? "");
      }
    };

    loadEligibility();
  }, [id, isClient, status]);

  const submitRating = async () => {
    if (!barber || !selectedBookingId) return;

    setRatingLoading(true);
    setRatingMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: barber._id,
          bookingId: selectedBookingId,
          ratingValue,
          review,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit rating");

      setRatingMessage("Rating submitted.");
      setReview("");
      setEligibleBookings((previous) =>
        previous.filter((booking) => booking._id !== selectedBookingId)
      );
      const nextBooking = eligibleBookings.find(
        (booking) => booking._id !== selectedBookingId
      );
      setSelectedBookingId(nextBooking?._id ?? "");

      const profileRes = await fetch(`/api/barbers/${id}`);
      const profileJson = await profileRes.json().catch(() => ({}));
      if (profileRes.ok) setBarber(profileJson.barber);
    } catch (err) {
      setRatingMessage(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#181411]">
      <HeaderBack title="Barber Profile" />

      {loading && <p className="px-4 py-6 text-sm text-gray-500">Loading...</p>}
      {!loading && error && <p className="px-4 py-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && barber && (
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-12">
          <section className="flex gap-4 pt-4">
            <div
              className="h-28 w-28 shrink-0 rounded-lg bg-cover bg-center bg-zinc-100"
              style={{ backgroundImage: `url(${barber.avatar || "/avatar.svg"})` }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black">{barber.name}</h1>
              <p className="text-sm text-zinc-500">
                {barber.shopName || barber.location || "Location unavailable"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Star size={16} fill="#f2800d" stroke="none" />
                  {barber.rating ?? "No rating"} ({barber.reviews})
                </span>
                <span className="text-sm text-zinc-500">
                  {barber.completedJobs} completed jobs
                </span>
              </div>
              {barber.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {barber.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {barber.bio && (
            <section>
              <h2 className="text-lg font-bold">About</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{barber.bio}</p>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Services</h2>
              {barber.bookable ? (
                <Link
                  href={`/book?barberId=${barber._id}`}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white"
                >
                  Book
                </Link>
              ) : (
                <span className="text-sm font-semibold text-red-600">Unavailable</span>
              )}
            </div>

            <div className="mt-3 divide-y rounded-lg border border-zinc-200">
              {barber.services.length === 0 && (
                <p className="p-4 text-sm text-zinc-500">No active services yet.</p>
              )}
              {barber.services.map((service) => (
                <div key={service._id} className="flex justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    {service.description && (
                      <p className="mt-1 text-sm text-zinc-500">{service.description}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-500">
                      {service.durationMinutes ?? 30} min
                    </p>
                  </div>
                  <p className="shrink-0 font-bold">NGN {service.price}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Rate Barber</h2>
                <p className="text-sm text-zinc-500">
                  Ratings are available once per paid accepted booking. Submitting a rating confirms the service is completed.
                </p>
              </div>
              {!isClient && status !== "loading" && (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white"
                >
                  Sign in
                </button>
              )}
            </div>

            {isClient && !canRate && (
              <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
                No paid accepted booking is currently available to rate.
              </p>
            )}

            {canRate && (
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold">Booking</span>
                  <select
                    value={selectedBookingId}
                    onChange={(event) => setSelectedBookingId(event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-zinc-200 px-3"
                  >
                    {eligibleBookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.service} - {new Date(booking.dateTime).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedBooking && (
                  <p className="text-xs text-zinc-500">
                    Selected booking: {new Date(selectedBooking.dateTime).toLocaleString()}
                  </p>
                )}

                <div>
                  <span className="text-sm font-semibold">Rating</span>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRatingValue(value)}
                        className="rounded-md p-1"
                        aria-label={`${value} star rating`}
                      >
                        <Star
                          size={28}
                          fill={value <= ratingValue ? "#f2800d" : "none"}
                          stroke={value <= ratingValue ? "#f2800d" : "#71717a"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold">Review</span>
                  <textarea
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    maxLength={1000}
                    className="mt-2 min-h-28 w-full rounded-lg border border-zinc-200 p-3"
                    placeholder="Share your experience (optional)"
                  />
                </label>

                {ratingMessage && (
                  <p className="text-sm text-zinc-600">{ratingMessage}</p>
                )}

                <button
                  type="button"
                  onClick={submitRating}
                  disabled={ratingLoading || !selectedBookingId}
                  className="h-11 w-full rounded-lg bg-orange-500 font-bold text-white disabled:opacity-60"
                >
                  {ratingLoading ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold">Recent Reviews</h2>
            <div className="mt-3 space-y-3">
              {(!barber.recentReviews || barber.recentReviews.length === 0) && (
                <p className="text-sm text-zinc-500">No reviews yet.</p>
              )}
              {barber.recentReviews?.map((item) => (
                <div key={item._id} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.userId?.name || "Client"}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Star size={14} fill="#f2800d" stroke="none" />
                      {item.rate}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="mt-2 text-sm text-zinc-600">{item.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
