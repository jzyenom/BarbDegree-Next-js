"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const hasHandledRedirect = useRef(false);

  useEffect(() => {
    if (status === "loading" || hasHandledRedirect.current) return;

    if (!session?.user) {
      hasHandledRedirect.current = true;
      router.replace("/login");
      return;
    }

    const role = session.user.role;
    if (role) {
      hasHandledRedirect.current = true;
      router.replace(`/dashboard/${role}`);
      return;
    }

    const requestedRole = searchParams?.get("role");
    const selectedRole =
      requestedRole === "barber" || requestedRole === "client"
        ? requestedRole
        : null;

    if (!selectedRole) {
      hasHandledRedirect.current = true;
      router.replace("/register");
      return;
    }

    hasHandledRedirect.current = true;

    (async () => {
      try {
        const response = await fetch("/api/role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedRole }),
        });

        if (!response.ok) {
          router.replace("/register");
          return;
        }

        router.replace(`/register/${selectedRole}`);
      } catch {
        router.replace("/register");
      }
    })();
  }, [router, searchParams, session, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
      <p className="text-sm font-medium">Redirecting...</p>
    </div>
  );
}
