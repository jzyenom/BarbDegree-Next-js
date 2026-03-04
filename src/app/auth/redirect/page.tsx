"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const role = session.user.role;
    if (role) {
      router.replace(`/dashboard/${role}`);
      return;
    }

    router.replace("/register");
  }, [router, session, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
      <p className="text-sm font-medium">Redirecting...</p>
    </div>
  );
}
