/**
 * AUTO-FILE-COMMENT: src/components/ui/ButtonRow.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
interface ButtonRowProps {
  onEdit: () => void;
  onConfirm: () => void;
}

/**
 * AUTO-FUNCTION-COMMENT: ButtonRow
 * Purpose: Handles button row.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex flex-1 gap-3 px-4 py-3 justify-between">`.
 * 3. Executes `<button`.
 * 4. Executes `onClick={onEdit}`.
 * 5. Executes `className="flex flex-1 items-center justify-center h-12 bg-[#f5f2f0] text-[#181411] font-bold rounded-lg"`.
 * 6. Executes `>`.
 * 7. Executes `Edit`.
 * 8. Executes `</button>`.
 * 9. Executes `<button`.
 * 10. Executes `onClick={onConfirm}`.
 * 11. Executes `className="flex flex-1 items-center justify-center h-12 bg-[#f2800d] text-[#181411] font-bold rounded-lg"`.
 * 12. Executes `>`.
 * 13. Executes `Confirm Booking`.
 * 14. Executes `</button>`.
 * 15. Executes `</div>`.
 * 16. Executes `);`.
 */
export default function ButtonRow({ onEdit, onConfirm }: ButtonRowProps) {
  return (
    <div className="flex flex-1 gap-3 px-4 py-3 justify-between">
      <button
        onClick={onEdit}
        className="flex flex-1 items-center justify-center h-12 bg-[#f5f2f0] text-[#181411] font-bold rounded-lg"
      >
        Edit
      </button>
      <button
        onClick={onConfirm}
        className="flex flex-1 items-center justify-center h-12 bg-[#f2800d] text-[#181411] font-bold rounded-lg"
      >
        Confirm Booking
      </button>
    </div>
  );
}
