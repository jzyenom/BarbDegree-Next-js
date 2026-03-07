"use client";

type UpcomingCardProps = {
  label: string;
  title: string;
  time: string;
  imageUrl: string;
};

/**
 * AUTO-FUNCTION-COMMENT: UpcomingCard
 * Purpose: Handles upcoming card.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex items-center justify-between gap-4">`.
 * 3. Executes `<div className="space-y-1">`.
 * 4. Executes `<p className="text-sm text-[#8a7560]">{label}</p>`.
 * 5. Executes `<p className="text-lg font-semibold text-[#181411]">{title}</p>`.
 * 6. Executes `<p className="text-sm text-[#8a7560]">{time}</p>`.
 * 7. Executes `</div>`.
 * 8. Executes `<div className="h-20 w-28 overflow-hidden rounded-2xl bg-[#f5f2f0]">`.
 * 9. Executes `<img`.
 * 10. Executes `src={imageUrl}`.
 * 11. Executes `alt={title}`.
 * 12. Executes `className="h-full w-full object-cover"`.
 * 13. Executes `loading="lazy"`.
 * 14. Executes `/>`.
 * 15. Executes `</div>`.
 * 16. Executes `</div>`.
 * 17. Executes `);`.
 */
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
