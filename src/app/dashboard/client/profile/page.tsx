"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Home, Mail, MapPin, Phone, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import LogoutButton from "@/components/LogoutButton";
import PasswordSettings from "@/components/PasswordSettings";

type MeResponse = {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    hasPassword?: boolean;
  };
  client?: {
    whatsapp?: string;
    mobile?: string;
    country?: string;
    state?: string;
    address?: string;
  };
};

function valueOrDash(value?: string | null) {
  return value == null || value === "" ? "-" : value;
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 border-b border-[#f1ebe5] py-3 last:border-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f2f0] text-[#181411]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-[#8a7560]">{label}</p>
        <p className="break-words text-sm font-medium text-[#181411]">{valueOrDash(value)}</p>
      </div>
    </div>
  );
}

export default function ClientProfilePage() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/me");
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Could not load profile");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const avatar = useMemo(() => {
    const raw = data?.user?.avatar || "/avatar.svg";
    return raw === "avatar.png" ? "/avatar.svg" : raw;
  }, [data]);

  return (
    <div className="min-h-screen bg-white pb-28 text-[#181411]">
      <PageHeader
        title="Profile"
        titleClassName="text-xl"
        className="pt-6"
        left={<div className="w-6" />}
        right={<LogoutButton />}
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {loading && <p className="text-sm text-[#8a7560]">Loading profile...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            <section className="rounded-lg border border-[#e6e0db] p-4">
              <div className="flex items-center gap-4">
                <div className="relative size-20 overflow-hidden rounded-lg bg-[#f5f2f0]">
                  <Image src={avatar} alt="Client profile" fill className="object-cover" unoptimized />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold">{data?.user?.name || "Client"}</h1>
                  <p className="truncate text-sm text-[#8a7560]">{data?.user?.email}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#fff4ea] px-3 py-1 text-xs font-semibold text-[#9a4b00]">
                    Client
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#e6e0db] p-4">
              <h2 className="mb-2 text-base font-bold">Contact</h2>
              <ProfileRow icon={Mail} label="Email" value={data?.user?.email} />
              <ProfileRow icon={Phone} label="Mobile" value={data?.client?.mobile} />
              <ProfileRow icon={Phone} label="WhatsApp" value={data?.client?.whatsapp} />
            </section>

            <section className="rounded-lg border border-[#e6e0db] p-4">
              <h2 className="mb-2 text-base font-bold">Location</h2>
              <ProfileRow icon={MapPin} label="Address" value={data?.client?.address} />
              <ProfileRow icon={Home} label="State" value={data?.client?.state} />
              <ProfileRow icon={MapPin} label="Country" value={data?.client?.country} />
            </section>

            <PasswordSettings
              hasPassword={Boolean(data?.user?.hasPassword)}
              onSuccess={() =>
                setData((previous) =>
                  previous?.user
                    ? {
                        ...previous,
                        user: { ...previous.user, hasPassword: true },
                      }
                    : previous
                )
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/book"
                className="flex h-11 items-center justify-center rounded-lg bg-[#f2800d] text-sm font-bold text-white"
              >
                Book a Barber
              </Link>
              <Link
                href="/bookings"
                className="flex h-11 items-center justify-center rounded-lg border border-[#f2800d] text-sm font-bold text-[#f2800d]"
              >
                View Bookings
              </Link>
            </div>
          </div>
        )}
      </main>

      <BottomNav
        variant="light"
        activeItem="Profile"
        items={[
          { name: "Home", icon: Home, href: "/dashboard/client" },
          { name: "Book", icon: Calendar, href: "/book" },
          { name: "Profile", icon: User, href: "/dashboard/client/profile" },
        ]}
      />
    </div>
  );
}
