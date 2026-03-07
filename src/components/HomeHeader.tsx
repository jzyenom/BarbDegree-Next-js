/**
 * AUTO-FILE-COMMENT: src/components/HomeHeader.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import NotificationsBell from "@/components/NotificationsBell";
import LogoutButton from "@/components/LogoutButton";

/**
 * AUTO-FUNCTION-COMMENT: HomeHeader
 * Purpose: Handles home header.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const profileName = useAppSelector((state) => state.user.user?.name);`.
 * 3. Executes `const derivedName = session?.user?.email`.
 * 4. Executes `? session.user.email.split("@")[0]`.
 * 5. Executes `: "";`.
 * 6. Executes `const userName = profileName || session?.user?.name || derivedName || "Guest";`.
 * 7. Executes `return (`.
 * 8. Executes `<header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">`.
 * 9. Executes `<div className="flex items-center justify-between p-4 h-16">`.
 * 10. Executes `<div className="flex items-center justify-start w-1/4">`.
 * 11. Executes `<span className="material-symbols-outlined rotate-90 text-[28px]">`.
 * 12. Executes `content_cut`.
 * 13. Executes `</span>`.
 * 14. Executes `</div>`.
 * 15. Executes `<div className="flex-1 text-center">`.
 * 16. Executes `<p className="text-lg font-bold">Welcome back, {userName}</p>`.
 * 17. Executes `</div>`.
 * 18. Executes `<div className="flex w-1/4 items-center justify-end gap-2">`.
 * 19. Executes `<NotificationsBell />`.
 * 20. Executes `<button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">`.
 * 21. Executes `<User className="w-5 h-5 text-gray-500" />`.
 * 22. Executes `</button>`.
 * 23. Executes `<LogoutButton />`.
 * 24. Executes `</div>`.
 * 25. Executes `</div>`.
 * 26. Executes `</header>`.
 * 27. Executes `);`.
 */
export default function HomeHeader() {
  const { data: session } = useSession();
  const profileName = useAppSelector((state) => state.user.user?.name);
  const derivedName = session?.user?.email
    ? session.user.email.split("@")[0]
    : "";
  const userName = profileName || session?.user?.name || derivedName || "Guest";
  return (
    <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center justify-start w-1/4">
          <span className="material-symbols-outlined rotate-90 text-[28px]">
            content_cut
          </span>
        </div>
        <div className="flex-1 text-center">
          <p className="text-lg font-bold">Welcome back, {userName}</p>
        </div>
        <div className="flex w-1/4 items-center justify-end gap-2">
          <NotificationsBell />
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="w-5 h-5 text-gray-500" />
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
