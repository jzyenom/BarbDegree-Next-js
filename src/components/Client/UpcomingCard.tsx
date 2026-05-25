"use client";

import Image from "next/image";

type UpcomingCardProps = {
  label: string;
  title: string;
  time: string;
  imageUrl: string;
};


export default function UpcomingCard({
  label,
  title,
  time,
  imageUrl,
}: UpcomingCardProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        {/* show text */}
        <p className="text-sm text-[#8a7560]">{label}</p>
        {/* show text */}
        <p className="text-lg font-semibold text-[#181411]">{title}</p>
        {/* show text */}
        <p className="text-sm text-[#8a7560]">{time}</p>
      </div>
      <div className="h-20 w-28 overflow-hidden rounded-2xl bg-[#f5f2f0]">
        <Image
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          width={112}
          height={80}
          unoptimized
        />
      </div>
    </div>
  );
}
