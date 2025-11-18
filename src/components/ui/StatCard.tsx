interface StatCardProps {
  title: string;
  amount: string;
  duration: string;
  percentageChange: string;
}

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
