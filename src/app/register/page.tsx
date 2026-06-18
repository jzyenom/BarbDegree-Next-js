"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type RequestError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};


export default function RoleSelectionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role) {
      router.replace("/auth/redirect");
    }
  }, [router, session, status]);

  
  const handleRoleSelect = async (role: "barber" | "client") => {
    if (!session?.user?.email) {
      router.push(`/login?mode=signup&role=${role}`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<{ message: string }>("/api/role", {
        role,
      });
      if (response.data.message === "Role updated") {
        router.push(`/register/${role}`);
      }
    } catch (err: unknown) {
      console.error("Role selection failed:", err);
      const requestError = err as RequestError;
      const errorMessage =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Failed to save role. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-screen mobile-shell safe-x safe-top safe-bottom flex flex-col items-center justify-center bg-gray-50 text-center">
      {/* show the main heading */}
      <h1 className="mb-3 text-2xl font-semibold">Tell us who you are</h1>
      {/* show text */}
      <p className="mb-6 text-sm text-gray-600">
        Choose your role to personalize your experience
      </p>
      <div className="grid w-full grid-cols-2 gap-3">
        <button
          onClick={() => handleRoleSelect("barber")}
          disabled={loading}
          className="rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50"
        >
          <h2 className="font-semibold mt-2">I&apos;m a Barber</h2>
        </button>

        <button
          onClick={() => handleRoleSelect("client")}
          disabled={loading}
          className="rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50"
        >
          <h2 className="font-semibold mt-2">I&apos;m a Client</h2>
        </button>
      </div>
      {loading && <p className="mt-4 text-sm text-gray-500">Saving role...</p>}
    </div>
  );
}
