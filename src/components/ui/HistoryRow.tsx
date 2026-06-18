interface HistoryRowProps {
  date: string;
  barber: string;
  amount: string;
}


export default function HistoryRow({ date, barber, amount }: HistoryRowProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 bg-white px-4 py-1.5">
      <div className="flex min-w-0 flex-col">
        {/* show text */}
        <p className="truncate text-sm font-medium text-[#181411]">Date: {date}</p>
        {/* show text */}
        <p className="truncate text-xs text-[#8a7560]">Barber: {barber}</p>
      </div>

      {/* show text */}
      <p className="shrink-0 text-sm text-[#181411]">{amount}</p>
    </div>
  );
}
