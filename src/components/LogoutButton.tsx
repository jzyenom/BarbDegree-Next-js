/**
 * AUTO-FILE-COMMENT: src/components/LogoutButton.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * AUTO-FUNCTION-COMMENT: LogoutButton
 * Purpose: Handles logout button.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<button`.
 * 3. Executes `onClick={() => signOut({ callbackUrl: "/login" })}`.
 * 4. Executes `className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"`.
 * 5. Executes `aria-label="Log out"`.
 * 6. Executes `title="Log out"`.
 * 7. Executes `>`.
 * 8. Executes `<LogOut className="w-5 h-5 text-gray-500" />`.
 * 9. Executes `</button>`.
 * 10. Executes `);`.
 */
export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
      aria-label="Log out"
      title="Log out"
    >
      <LogOut className="w-5 h-5 text-gray-500" />
    </button>
  );
}
