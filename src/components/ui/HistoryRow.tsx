interface HistoryRowProps {
  date: string;
  barber: string;
  amount: string;
}

export default function HistoryRow({ date, barber, amount }: HistoryRowProps) {
  return (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
      <div className="flex flex-col">
        <p className="text-[#181411] text-base font-medium">Date: {date}</p>
        <p className="text-[#8a7560] text-sm">Barber: {barber}</p>
      </div>

      <p className="text-[#181411] text-base">{amount}</p>
    </div>
  );
}
