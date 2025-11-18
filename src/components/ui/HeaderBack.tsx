"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderBackProps {
  title: string;
}

export default function HeaderBack({ title }: HeaderBackProps) {
  const router = useRouter();
  return (
    <div className="flex items-center bg-white p-4 pb-2 justify-between">
      <button
        onClick={() => router.back()}
        className="text-[#181411] flex size-12 items-center"
      >
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-[#181411] text-lg font-bold flex-1 text-center pr-12">
        {title}
      </h2>
    </div>
  );
}
