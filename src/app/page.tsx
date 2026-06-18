"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ClientMarketplaceHome from "@/components/ClientMarketplaceHome";
import Link from "next/link";

function LandingEntry() {
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
            <Link
              href="/login?mode=signup&role=client"
              className="flex h-[82px] w-full items-center justify-center rounded-full bg-white px-6 text-[29px] font-semibold leading-none text-[#242424] transition-transform active:scale-[0.98]"
            >
              Find a Barber
            </Link>
            <Link
              href="/login?mode=signup&role=barber"
              className="flex h-[84px] w-full items-center justify-center rounded-full bg-[#5d5d5b] px-6 text-[28px] font-semibold leading-none text-white transition-transform active:scale-[0.98]"
            >
              Join as a Barber
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}


export default function ClientHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "barber" || role === "admin" || role === "superadmin") {
        setRedirecting(true);
        router.replace(`/dashboard/${role}`);
        return;
      }
    }
  }, [router, session?.user?.role, status]);

  if (status === "unauthenticated") {
    return <LandingEntry />;
  }

  if (status === "loading" || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#202020] text-white">
        <p className="text-sm font-semibold">Loading...</p>
      </div>
    );
  }

  return <ClientMarketplaceHome />;
}
