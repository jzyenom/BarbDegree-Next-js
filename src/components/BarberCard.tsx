"use client";

import Link from "next/link";
import { Star } from "lucide-react";

interface BarberCardProps {
  name: string;
  location?: string;
  rating?: number | null;
  reviews?: number | null;
  badges?: string[];
  price?: number | null;
  image: string;
  href?: string;
  profileHref?: string;
  bookable?: boolean;
}


export default function BarberCard({
  name,
  location,
  rating,
  reviews,
  badges = [],
  price,
  image,
  href,
  profileHref,
  bookable = true,
}: BarberCardProps) {
  const hasRating = typeof rating === "number" && typeof reviews === "number";
  const hasPrice = typeof price === "number" && !Number.isNaN(price);

  return (
    <div className="flex flex-col h-full gap-3 rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-md hover:scale-[1.02]">
      {/* Image */}
      <div
        className="w-full aspect-square bg-cover bg-center rounded-lg bg-zinc-100 dark:bg-zinc-800"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />

      {/* Text + Actions */}
      <div className="flex flex-col flex-1 gap-2">
        <div>
          {/* show text */}
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {name || "Name unavailable"}
          </p>
          {location ? (
            // show text
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {location}
            </p>
          ) : (
            // show text
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Location unavailable
            </p>
          )}
        </div>

        {/* Rating */}
        {hasRating ? (
          <div className="flex items-center gap-1">
            <Star size={16} fill="#ff8c00" stroke="none" />
            {/* show inline text */}
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {rating}
            </span>
            {/* show inline text */}
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              ({reviews})
            </span>
          </div>
        ) : (
          // show text
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No ratings yet
          </p>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 2).map((badge) => (
              // show inline text
              <span
                key={badge}
                className="rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {hasPrice ? `From ${price}` : "Pricing unavailable"}
        </p>

        {/* ✅ The "Book Now" button */}
        {!bookable && (
          // show text
          <p className="text-xs font-semibold text-red-600">
            This barber is currently unavailable for booking.
          </p>
        )}

        <div className="mt-auto grid grid-cols-1 gap-2">
          {profileHref && (
            <Link
              href={profileHref}
              className="h-10 w-full rounded-lg border border-orange-500 text-orange-600 text-sm font-bold hover:bg-orange-50 transition-all flex items-center justify-center"
            >
              View Profile
            </Link>
          )}

          {href && bookable ? (
            <Link
              href={href}
              className="h-10 w-full rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all flex items-center justify-center"
            >
              Book Now
            </Link>
          ) : (
            <button
              className="h-10 w-full rounded-lg bg-zinc-300 text-zinc-600 text-sm font-bold transition-all disabled:cursor-not-allowed"
              type="button"
              disabled
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// <button
//   onClick={() => router.push(`/book/${barberId}`)}
//   className="mt-auto bg-primary text-white text-sm font-bold rounded-lg h-10 hover:bg-orange-600"
// >
//   Book Now
// </button>
