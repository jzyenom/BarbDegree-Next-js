import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";
import LogoutButton from "@/components/LogoutButton";
import PageHeader from "@/components/ui/PageHeader";

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
