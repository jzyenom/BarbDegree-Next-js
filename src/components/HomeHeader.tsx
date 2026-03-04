"use client";

import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import NotificationsBell from "@/components/NotificationsBell";
import LogoutButton from "@/components/LogoutButton";

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
