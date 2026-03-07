"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";

interface HeaderBackProps {
  title: string;
}

/**
 * AUTO-FUNCTION-COMMENT: HeaderBack
 * Purpose: Handles header back.
 * Line-by-line:
 * 1. Executes `const router = useRouter();`.
 * 2. Executes `return (`.
 * 3. Executes `<div className="flex items-center bg-white p-4 pb-2 justify-between">`.
 * 4. Executes `<button`.
 * 5. Executes `onClick={() => router.back()}`.
 * 6. Executes `className="text-[#181411] flex size-12 items-center"`.
 * 7. Executes `>`.
 * 8. Executes `<ArrowLeft size={24} />`.
 * 9. Executes `</button>`.
 * 10. Executes `<h2 className="text-[#181411] text-lg font-bold flex-1 text-center">`.
 * 11. Executes `{title}`.
 * 12. Executes `</h2>`.
 * 13. Executes `<div className="flex items-center justify-end">`.
 * 14. Executes `<NotificationsBell />`.
 * 15. Executes `</div>`.
 * 16. Executes `</div>`.
 * 17. Executes `);`.
 */
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
      <h2 className="text-[#181411] text-lg font-bold flex-1 text-center">
        {title}
      </h2>
      <div className="flex items-center justify-end">
        <NotificationsBell />
      </div>
    </div>
  );
}
