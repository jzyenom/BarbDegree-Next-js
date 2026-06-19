"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
    <main className="min-h-[100svh] bg-[#1f1f1f] text-white">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[556px] flex-col bg-[#1f1f1f]">
        <section className="relative h-[60.1svh] min-h-[420px] overflow-hidden bg-[#1f1f1f]">
          <Image
            src="/Splash_Image.png"
            alt="Barber ready to deliver a premium grooming service"
            fill
            priority
            className="object-cover object-[52%_8%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-[#1f1f1f]/45 to-[#1f1f1f]" />
        </section>

        <section className="flex flex-1 flex-col items-center px-[34px] pb-[74px] pt-[52px] text-center">
          <h1 className="text-[43px] font-normal leading-none tracking-normal text-white">
            SHARP
          </h1>
          <p className="mt-[18px] text-[24px] font-medium leading-tight text-white/90">
            Premium grooming, delivered.
          </p>

          <div className="mt-[56px] flex w-full flex-col gap-[23px]">
            <button
              type="button"
              onClick={() => handleRoleSelect("client")}
              disabled={loading}
              className="flex h-[82px] w-full items-center justify-center rounded-full bg-white px-6 text-[29px] font-semibold leading-none text-[#242424] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              Find a Barber
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("barber")}
              disabled={loading}
              className="flex h-[84px] w-full items-center justify-center rounded-full bg-[#5d5d5b] px-6 text-[28px] font-semibold leading-none text-white transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              Join as a Barber
            </button>
          </div>

          {loading && <p className="mt-6 text-sm font-semibold text-white/70">Saving role...</p>}
        </section>
      </div>
    </main>
  );
}
