/**
 * AUTO-FILE-COMMENT: src/components/Barber/BarberHeader.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";
import LogoutButton from "@/components/LogoutButton";
import PageHeader from "@/components/ui/PageHeader";

/**
 * AUTO-FUNCTION-COMMENT: BarberHeader
 * Purpose: Handles barber header.
 * Line-by-line:
 * 1. Executes `const router = useRouter();`.
 * 2. Executes `return (`.
 * 3. Executes `<div className="mt-5">`.
 * 4. Executes `<PageHeader`.
 * 5. Executes `title={title}`.
 * 6. Executes `className="pb-2 border-b border-gray-100"`.
 * 7. Executes `titleClassName="text-2xl"`.
 * 8. Executes `left={`.
 * 9. Executes `<button`.
 * 10. Executes `type="button"`.
 * 11. Executes `onClick={() => router.back()}`.
 * 12. Executes `className="text-[#181411] flex items-center justify-center"`.
 * 13. Executes `>`.
 * 14. Executes `<ArrowLeft className="w-6 h-6" />`.
 * 15. Executes `</button>`.
 * 16. Executes `}`.
 * 17. Executes `right={`.
 * 18. Executes `<div className="flex items-center justify-end gap-2">`.
 * 19. Executes `<NotificationsBell />`.
 * 20. Executes `<LogoutButton />`.
 * 21. Executes `</div>`.
 * 22. Executes `}`.
 * 23. Executes `/>`.
 * 24. Executes `</div>`.
 * 25. Executes `);`.
 */
export default function BarberHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="mt-5">
      <PageHeader
        title={title}
        className="pb-2 border-b border-gray-100"
        titleClassName="text-2xl"
        left={
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[#181411] flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        }
        right={
          <div className="flex items-center justify-end gap-2">
            <NotificationsBell />
            <LogoutButton />
          </div>
        }
      />
    </div>
  );
}
