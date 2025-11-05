"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function RoleSelectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: "barber" | "client") => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      await axios.post("/api/role", { email: session.user.email, role });
      router.push(`/register/${role}`);
    } catch (err) {
      console.error("Role selection failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Tell us who you are</h1>
      <p className="text-gray-600 mb-8">Choose your role to personalize your experience</p>
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => handleRoleSelect("barber")}
          className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
        >
          💈 <h2 className="font-semibold mt-2">I’m a Barber</h2>
        </button>

        <button
          onClick={() => handleRoleSelect("client")}
          className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
        >
          👥 <h2 className="font-semibold mt-2">I’m a Client</h2>
        </button>
      </div>
      {loading && <p className="mt-4 text-sm text-gray-500">Saving role...</p>}
    </div>
  );
}
