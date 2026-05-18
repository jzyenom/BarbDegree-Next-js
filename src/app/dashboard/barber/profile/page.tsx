"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  Home,
  Mail,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  User,
} from "lucide-react";
import BottomNav, { barberNavItems } from "@/components/BottomNav";
import BarberHeader from "@/components/Barber/BarberHeader";
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
  barber?: {
    avatar?: string;
    whatsapp?: string;
    mobile?: string;
    country?: string;
    state?: string;
    address?: string;
    bio?: string;
    exp?: string;
    charge?: string;
    bankName?: string;
    subscriptionStatus?: string;
    subscriptionActive?: boolean;
    subscriptionExpiresAt?: string;
    adminSubscriptionOverride?: boolean;
    services?: Array<{
      _id: string;
      name: string;
      price?: number;
      isActive?: boolean;
    }>;
  };
};

function valueOrDash(value?: string | number | null) {
  return value == null || value === "" ? "-" : String(value);
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value?: string | number | null;
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

export default function BarberProfilePage() {
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
    const raw = data?.barber?.avatar || data?.user?.avatar || "/avatar.svg";
    return raw === "avatar.png" ? "/avatar.svg" : raw;
  }, [data]);

  const subscriptionLabel = data?.barber?.subscriptionActive ? "Active" : "Inactive";
  const serviceCount = data?.barber?.services?.length ?? 0;

  return (
    <div className="min-h-screen bg-white pb-28 text-[#181411]">
      <BarberHeader title="Profile" />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {loading && <p className="text-sm text-[#8a7560]">Loading profile...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            <section className="rounded-lg border border-[#e6e0db] p-4">
              <div className="flex items-center gap-4">
                <div className="relative size-20 overflow-hidden rounded-lg bg-[#f5f2f0]">
                  <Image src={avatar} alt="Barber profile" fill className="object-cover" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-bold">{data?.user?.name || "Barber"}</h1>
                  <p className="truncate text-sm text-[#8a7560]">{data?.user?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#fff4ea] px-3 py-1 text-xs font-semibold text-[#9a4b00]">
                      {subscriptionLabel}
                    </span>
                    <span className="rounded-full bg-[#f5f2f0] px-3 py-1 text-xs font-semibold">
                      {serviceCount} services
                    </span>
                  </div>
                </div>
                <LogoutButton />
              </div>
            </section>

            <section className="rounded-lg border border-[#e6e0db] p-4">
              <h2 className="mb-2 text-base font-bold">Business Details</h2>
              <ProfileRow icon={MapPin} label="Address" value={data?.barber?.address} />
              <ProfileRow icon={Home} label="Location" value={[data?.barber?.state, data?.barber?.country].filter(Boolean).join(", ")} />
              <ProfileRow icon={Scissors} label="Experience" value={data?.barber?.exp} />
              <ProfileRow icon={Banknote} label="Starting charge" value={data?.barber?.charge} />
            </section>

            <section className="rounded-lg border border-[#e6e0db] p-4">
              <h2 className="mb-2 text-base font-bold">Contact</h2>
              <ProfileRow icon={Mail} label="Email" value={data?.user?.email} />
              <ProfileRow icon={Phone} label="Mobile" value={data?.barber?.mobile} />
              <ProfileRow icon={Phone} label="WhatsApp" value={data?.barber?.whatsapp} />
            </section>

            <section className="rounded-lg border border-[#e6e0db] p-4">
              <h2 className="mb-2 text-base font-bold">Subscription</h2>
              <ProfileRow icon={ShieldCheck} label="Status" value={data?.barber?.subscriptionStatus || "inactive"} />
              <ProfileRow
                icon={CalendarClock}
                label="Expires"
                value={
                  data?.barber?.subscriptionExpiresAt
                    ? new Date(data.barber.subscriptionExpiresAt).toLocaleDateString()
                    : "-"
                }
              />
              <ProfileRow
                icon={BadgeCheck}
                label="Admin override"
                value={data?.barber?.adminSubscriptionOverride ? "Enabled" : "Disabled"}
              />
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
                href="/dashboard/barber/services"
                className="flex h-11 items-center justify-center rounded-lg border border-[#f2800d] text-sm font-bold text-[#f2800d]"
              >
                Manage Services
              </Link>
              <Link
                href="/dashboard/barber"
                className="flex h-11 items-center justify-center rounded-lg bg-[#f2800d] text-sm font-bold text-white"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        )}
      </main>

      <BottomNav items={barberNavItems} activeItem="Profile" />
    </div>
  );
}
