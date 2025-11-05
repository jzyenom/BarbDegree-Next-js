"use client";

import { Bell, User } from "lucide-react";

export default function HomeHeader({ userName }: { userName: string }) {
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
          <button className="relative p-2 rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background-light dark:ring-background-dark" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
