"use client";

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
        <p className="text-sm text-[#8a7560]">{label}</p>
        <p className="text-lg font-semibold text-[#181411]">{title}</p>
        <p className="text-sm text-[#8a7560]">{time}</p>
      </div>
      <div className="h-20 w-28 overflow-hidden rounded-2xl bg-[#f5f2f0]">
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
