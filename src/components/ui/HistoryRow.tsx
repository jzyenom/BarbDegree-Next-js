/**
 * AUTO-FILE-COMMENT: src/components/ui/HistoryRow.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
interface HistoryRowProps {
  date: string;
  barber: string;
  amount: string;
}

/**
 * AUTO-FUNCTION-COMMENT: HistoryRow
 * Purpose: Handles history row.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">`.
 * 3. Executes `<div className="flex flex-col">`.
 * 4. Executes `<p className="text-[#181411] text-base font-medium">Date: {date}</p>`.
 * 5. Executes `<p className="text-[#8a7560] text-sm">Barber: {barber}</p>`.
 * 6. Executes `</div>`.
 * 7. Executes `<p className="text-[#181411] text-base">{amount}</p>`.
 * 8. Executes `</div>`.
 * 9. Executes `);`.
 */
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
