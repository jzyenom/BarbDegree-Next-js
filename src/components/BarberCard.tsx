/**
 * AUTO-FILE-COMMENT: src/components/BarberCard.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: BarberCard
 * Purpose: Handles barber card.
 * Line-by-line:
 * 1. Executes `const hasRating = typeof rating === "number" && typeof reviews === "number";`.
 * 2. Executes `const hasPrice = typeof price === "number" && !Number.isNaN(price);`.
 * 3. Executes `return (`.
 * 4. Executes `<div className="flex flex-col h-full gap-3 rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-sm border border-zinc-100 dark:border-zinc-800...`.
 * 5. Executes `{/* Image * /}`.
 * 6. Executes `<div`.
 * 7. Executes `className="w-full aspect-square bg-cover bg-center rounded-lg bg-zinc-100 dark:bg-zinc-800"`.
 * 8. Executes `style={image ? { backgroundImage: \`url(${image})\` } : undefined}`.
 * 9. Executes `/>`.
 * 10. Executes `{/* Text + Actions * /}`.
 * 11. Executes `<div className="flex flex-col flex-1 gap-2">`.
 * 12. Executes `<div>`.
 * 13. Executes `<p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">`.
 * 14. Executes `{name || "Name unavailable"}`.
 * 15. Executes `</p>`.
 * 16. Executes `{location ? (`.
 * 17. Executes `<p className="text-sm text-zinc-500 dark:text-zinc-400">`.
 * 18. Executes `{location}`.
 * 19. Executes `</p>`.
 * 20. Executes `) : (`.
 * 21. Executes `<p className="text-sm text-zinc-400 dark:text-zinc-500">`.
 * 22. Executes `Location unavailable`.
 * 23. Executes `</p>`.
 * 24. Executes `)}`.
 * 25. Executes `</div>`.
 * 26. Executes `{/* Rating * /}`.
 * 27. Executes `{hasRating ? (`.
 * 28. Executes `<div className="flex items-center gap-1">`.
 * 29. Executes `<Star size={16} fill="#ff8c00" stroke="none" />`.
 * 30. Executes `<span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">`.
 * 31. Executes `{rating}`.
 * 32. Executes `</span>`.
 * 33. Executes `<span className="text-sm text-zinc-500 dark:text-zinc-400">`.
 * 34. Executes `({reviews})`.
 * 35. Executes `</span>`.
 * 36. Executes `</div>`.
 * 37. Executes `) : (`.
 * 38. Executes `<p className="text-sm text-zinc-400 dark:text-zinc-500">`.
 * 39. Executes `No ratings yet`.
 * 40. Executes `</p>`.
 * 41. Executes `)}`.
 * 42. Executes `{/* Price * /}`.
 * 43. Executes `<p className="text-sm text-zinc-500 dark:text-zinc-400">`.
 * 44. Executes `{hasPrice ? \`From ${price}\` : "Pricing unavailable"}`.
 * 45. Executes `</p>`.
 * 46. Executes `{/* ✅ The "Book Now" button * /}`.
 * 47. Executes `{href ? (`.
 * 48. Executes `<Link`.
 * 49. Executes `href={href}`.
 * 50. Executes `className="mt-auto h-10 w-full rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all flex items-center...`.
 * 51. Executes `>`.
 * 52. Executes `Book Now`.
 * 53. Executes `</Link>`.
 * 54. Executes `) : (`.
 * 55. Executes `<button`.
 * 56. Executes `className="mt-auto h-10 w-full rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all"`.
 * 57. Executes `type="button"`.
 * 58. Executes `>`.
 * 59. Executes `Book Now`.
 * 60. Executes `</button>`.
 * 61. Executes `)}`.
 * 62. Executes `</div>`.
 * 63. Executes `</div>`.
 * 64. Executes `);`.
 */
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
