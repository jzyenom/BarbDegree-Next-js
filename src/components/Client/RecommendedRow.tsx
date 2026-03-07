"use client";

import { Star } from "lucide-react";

type RecommendedRowProps = {
  title: string;
  rating: number;
  reviews: number;
  imageUrl: string;
};

/**
 * AUTO-FUNCTION-COMMENT: RecommendedRow
 * Purpose: Handles recommended row.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex items-center justify-between gap-4">`.
 * 3. Executes `<div className="space-y-1">`.
 * 4. Executes `<p className="text-lg font-semibold text-[#181411]">{title}</p>`.
 * 5. Executes `<div className="flex items-center gap-1 text-sm text-[#8a7560]">`.
 * 6. Executes `<Star size={16} className="text-[#f2a24f]" />`.
 * 7. Executes `<span>{rating.toFixed(1)}</span>`.
 * 8. Executes `<span>({reviews})</span>`.
 * 9. Executes `</div>`.
 * 10. Executes `</div>`.
 * 11. Executes `<div className="h-16 w-24 overflow-hidden rounded-2xl bg-[#f5f2f0]">`.
 * 12. Executes `<img`.
 * 13. Executes `src={imageUrl}`.
 * 14. Executes `alt={title}`.
 * 15. Executes `className="h-full w-full object-cover"`.
 * 16. Executes `loading="lazy"`.
 * 17. Executes `/>`.
 * 18. Executes `</div>`.
 * 19. Executes `</div>`.
 * 20. Executes `);`.
 */
export default function RecommendedRow({
  title,
  rating,
  reviews,
  imageUrl,
}: RecommendedRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-[#181411]">{title}</p>
        <div className="flex items-center gap-1 text-sm text-[#8a7560]">
          <Star size={16} className="text-[#f2a24f]" />
          <span>{rating.toFixed(1)}</span>
          <span>({reviews})</span>
        </div>
      </div>
      <div className="h-16 w-24 overflow-hidden rounded-2xl bg-[#f5f2f0]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
