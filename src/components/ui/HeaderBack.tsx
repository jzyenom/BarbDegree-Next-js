"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";

interface HeaderBackProps {
  title: string;
}


export default function HeaderBack({ title }: HeaderBackProps) {
  const router = useRouter();
  return (
    <div className="safe-top flex items-center justify-between bg-white px-3 pb-1">
      <button
        onClick={() => router.back()}
        className="flex size-10 items-center text-[#181411]"
      >
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-[#181411] text-lg font-bold flex-1 text-center">
        {title}
      </h2>
      <div className="flex items-center justify-end">
        <NotificationsBell />
      </div>
    </div>
  );
}
