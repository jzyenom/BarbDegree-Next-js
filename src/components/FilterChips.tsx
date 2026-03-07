/**
 * AUTO-FILE-COMMENT: src/components/FilterChips.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { SlidersHorizontal, MapPin, Star, Tag, ChevronDown } from "lucide-react";

/**
 * AUTO-FUNCTION-COMMENT: FilterChips
 * Purpose: Handles filter chips.
 * Line-by-line:
 * 1. Executes `const filters = [`.
 * 2. Executes `{ icon: SlidersHorizontal, label: "Filters" },`.
 * 3. Executes `{ icon: MapPin, label: "Location", dropdown: true },`.
 * 4. Executes `{ icon: Star, label: "Rating", dropdown: true },`.
 * 5. Executes `{ icon: Tag, label: "Price", dropdown: true },`.
 * 6. Executes `];`.
 * 7. Executes `return (`.
 * 8. Executes `<div className="flex gap-3 px-4 overflow-x-auto pb-2">`.
 * 9. Executes `{filters.map(({ icon: Icon, label, dropdown }) => (`.
 * 10. Executes `<button`.
 * 11. Executes `key={label}`.
 * 12. Executes `className="flex items-center gap-2 h-10 px-4 rounded-lg bg-content-light dark:bg-content-dark shadow-sm whitespace-nowrap"`.
 * 13. Executes `>`.
 * 14. Executes `<Icon size={18} className="text-gray-500" />`.
 * 15. Executes `<p className="text-sm font-medium">{label}</p>`.
 * 16. Executes `{dropdown && <ChevronDown size={18} className="text-gray-500" />}`.
 * 17. Executes `</button>`.
 * 18. Executes `))}`.
 * 19. Executes `</div>`.
 * 20. Executes `);`.
 */
export default function FilterChips() {
  const filters = [
    { icon: SlidersHorizontal, label: "Filters" },
    { icon: MapPin, label: "Location", dropdown: true },
    { icon: Star, label: "Rating", dropdown: true },
    { icon: Tag, label: "Price", dropdown: true },
  ];

  return (
    <div className="flex gap-3 px-4 overflow-x-auto pb-2">
      {filters.map(({ icon: Icon, label, dropdown }) => (
        <button
          key={label}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-content-light dark:bg-content-dark shadow-sm whitespace-nowrap"
        >
          <Icon size={18} className="text-gray-500" />
          <p className="text-sm font-medium">{label}</p>
          {dropdown && <ChevronDown size={18} className="text-gray-500" />}
        </button>
      ))}
    </div>
  );
}
