/**
 * AUTO-FILE-COMMENT: src/components/ui/ActionRow.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { FileText } from "lucide-react";

interface ActionRowProps {
  label: string;
  onClick?: () => void;
}

/**
 * AUTO-FUNCTION-COMMENT: ActionRow
 * Purpose: Handles action row.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<button`.
 * 3. Executes `onClick={onClick}`.
 * 4. Executes `className="flex items-center gap-4 bg-white px-4 min-h-14 w-full"`.
 * 5. Executes `>`.
 * 6. Executes `<div className="flex items-center justify-center size-10 rounded-lg bg-[#f5f2f0]">`.
 * 7. Executes `<FileText size={20} className="text-[#181411]" />`.
 * 8. Executes `</div>`.
 * 9. Executes `<p className="text-[#181411] text-base flex-1 truncate">{label}</p>`.
 * 10. Executes `</button>`.
 * 11. Executes `);`.
 */
export default function ActionRow({ label, onClick }: ActionRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-white px-4 min-h-14 w-full"
    >
      <div className="flex items-center justify-center size-10 rounded-lg bg-[#f5f2f0]">
        <FileText size={20} className="text-[#181411]" />
      </div>

      <p className="text-[#181411] text-base flex-1 truncate">{label}</p>
    </button>
  );
}
