interface StatCardProps {
  title: string;
  amount: string;
  duration: string;
  percentageChange: string;
}

/**
 * AUTO-FUNCTION-COMMENT: StatCard
 * Purpose: Handles stat card.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex min-w-72 flex-1 flex-col gap-2">`.
 * 3. Executes `<p className="text-[#181411] text-base font-medium">{title}</p>`.
 * 4. Executes `<p className="text-[#181411] text-[32px] font-bold tracking-tight truncate">`.
 * 5. Executes `{amount}`.
 * 6. Executes `</p>`.
 * 7. Executes `<div className="flex gap-2">`.
 * 8. Executes `<p className="text-[#8a7560] text-sm">{duration}</p>`.
 * 9. Executes `<p className="text-[#07880e] text-sm font-semibold">`.
 * 10. Executes `{percentageChange}`.
 * 11. Executes `</p>`.
 * 12. Executes `</div>`.
 * 13. Executes `</div>`.
 * 14. Executes `);`.
 */
export default function StatCard({
  title,
  amount,
  duration,
  percentageChange,
}: StatCardProps) {
  return (
    <div className="flex min-w-72 flex-1 flex-col gap-2">
      <p className="text-[#181411] text-base font-medium">{title}</p>
      <p className="text-[#181411] text-[32px] font-bold tracking-tight truncate">
        {amount}
      </p>

      <div className="flex gap-2">
        <p className="text-[#8a7560] text-sm">{duration}</p>
        <p className="text-[#07880e] text-sm font-semibold">
          {percentageChange}
        </p>
      </div>
    </div>
  );
}
