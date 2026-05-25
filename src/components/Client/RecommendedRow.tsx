"use client";

import Image from "next/image";
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
        {/* show text */}
        <p className="text-lg font-semibold text-[#181411]">{title}</p>
        <div className="flex items-center gap-1 text-sm text-[#8a7560]">
          <Star size={16} className="text-[#f2a24f]" />
          {/* show inline text */}
          <span>{rating.toFixed(1)}</span>
          {/* show inline text */}
          <span>({reviews})</span>
        </div>
      </div>
      <div className="h-16 w-24 overflow-hidden rounded-2xl bg-[#f5f2f0]">
        <Image
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          width={96}
          height={64}
          unoptimized
        />
      </div>
    </div>
  );
}
