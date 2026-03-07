/**
 * AUTO-FILE-COMMENT: src/components/ui/FilterPill.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
interface FilterPillProps {
  label: string;
}

/**
 * AUTO-FUNCTION-COMMENT: FilterPill
 * Purpose: Handles filter pill.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="flex h-8 items-center justify-center rounded-lg bg-[#f5f2f0] px-4">`.
 * 3. Executes `<p className="text-[#181411] text-sm font-medium">{label}</p>`.
 * 4. Executes `</div>`.
 * 5. Executes `);`.
 */
export default function FilterPill({ label }: FilterPillProps) {
  return (
    <div className="flex h-8 items-center justify-center rounded-lg bg-[#f5f2f0] px-4">
      <p className="text-[#181411] text-sm font-medium">{label}</p>
    </div>
  );
}
