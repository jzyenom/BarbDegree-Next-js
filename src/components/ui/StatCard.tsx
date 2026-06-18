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
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* show text */}
      <p className="text-[#181411] text-base font-medium">{title}</p>
      {/* show text */}
      <p className="truncate text-2xl font-bold tracking-tight text-[#181411]">
        {amount}
      </p>

      <div className="flex gap-2">
        {/* show text */}
        <p className="text-[#8a7560] text-sm">{duration}</p>
        {/* show text */}
        <p className="text-[#07880e] text-sm font-semibold">
          {percentageChange}
        </p>
      </div>
    </div>
  );
}
