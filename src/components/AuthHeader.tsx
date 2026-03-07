/**
 * AUTO-FILE-COMMENT: src/components/AuthHeader.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { ArrowLeft } from "lucide-react";

/**
 * AUTO-FUNCTION-COMMENT: AuthHeader
 * Purpose: Handles auth header.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<header className="flex items-center justify-between p-4 pb-2">`.
 * 3. Executes `<button className="flex items-center justify-center size-12">`.
 * 4. Executes `<ArrowLeft className="w-6 h-6" />`.
 * 5. Executes `</button>`.
 * 6. Executes `<h2 className="flex-1 text-center pr-12 text-lg font-bold">{title}</h2>`.
 * 7. Executes `</header>`.
 * 8. Executes `);`.
 */
export default function AuthHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between p-4 pb-2">
      <button className="flex items-center justify-center size-12">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h2 className="flex-1 text-center pr-12 text-lg font-bold">{title}</h2>
    </header>
  );
}
