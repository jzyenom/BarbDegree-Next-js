"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

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
