/**
 * AUTO-FILE-COMMENT: src/components/SearchBar.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { Search } from "lucide-react";

/**
 * AUTO-FUNCTION-COMMENT: SearchBar
 * Purpose: Handles search bar.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<div className="px-4">`.
 * 3. Executes `<div className="flex items-center h-14 bg-content-light dark:bg-content-dark rounded-lg shadow-sm">`.
 * 4. Executes `<div className="pl-4 text-gray-500">`.
 * 5. Executes `<Search className="w-5 h-5" />`.
 * 6. Executes `</div>`.
 * 7. Executes `<input`.
 * 8. Executes `type="text"`.
 * 9. Executes `placeholder={placeholder}`.
 * 10. Executes `className="flex-1 px-2 bg-transparent focus:outline-none text-sm"`.
 * 11. Executes `/>`.
 * 12. Executes `</div>`.
 * 13. Executes `</div>`.
 * 14. Executes `);`.
 */
export default function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="px-4">
      <div className="flex items-center h-14 bg-content-light dark:bg-content-dark rounded-lg shadow-sm">
        <div className="pl-4 text-gray-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 px-2 bg-transparent focus:outline-none text-sm"
        />
      </div>
    </div>
  );
}
