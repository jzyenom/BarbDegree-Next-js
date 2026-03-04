"use client";

import Link from "next/link";
import { Star } from "lucide-react";

interface BarberCardProps {
  name: string;
  location?: string;
  rating?: number | null;
  reviews?: number | null;
  price?: number | null;
  image: string;
  href?: string;
}

export default function BarberCard({
  name,
  location,
  rating,
  reviews,
  price,
  image,
  href,
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
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {name || "Name unavailable"}
          </p>
          {location ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {location}
            </p>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Location unavailable
            </p>
          )}
        </div>

        {/* Rating */}
        {hasRating ? (
          <div className="flex items-center gap-1">
            <Star size={16} fill="#ff8c00" stroke="none" />
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {rating}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              ({reviews})
            </span>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No ratings yet
          </p>
        )}

        {/* Price */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {hasPrice ? `From ${price}` : "Pricing unavailable"}
        </p>

        {/* ✅ The "Book Now" button */}
        {href ? (
          <Link
            href={href}
            className="mt-auto h-10 w-full rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all flex items-center justify-center"
          >
            Book Now
          </Link>
        ) : (
          <button
            className="mt-auto h-10 w-full rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all"
            type="button"
          >
            Book Now
          </button>
        )}
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
