"use client";

import { Star } from "lucide-react";

type RecommendedRowProps = {
  title: string;
  rating: number;
  reviews: number;
  imageUrl: string;
};

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
