"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HomeHeader from "@/components/HomeHeader";
import SearchBar from "@/components/SearchBar";
import HeroBanner from "@/components/HeroBanner";
import FilterChips from "@/components/FilterChips";
import BarberCard from "@/components/BarberCard";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

type BarberListItem = {
  _id: string;
  name: string;
  address?: string;
  state?: string;
  country?: string;
  charge?: string;
  avatar?: string;
};

export default function ClientHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [barbers, setBarbers] = useState<BarberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "barber" || role === "admin" || role === "superadmin") {
        router.replace(`/dashboard/${role}`);
        return;
      }
    }
  }, [router, session?.user?.role, status]);

  useEffect(() => {
    let mounted = true;

    const loadBarbers = async () => {
      try {
        const res = await fetch("/api/barbers");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load barbers");
        }
        if (mounted) {
          setBarbers(json.barbers ?? []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load barbers"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBarbers();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark pb-24">
      <HomeHeader />
      <main className="flex flex-col gap-4">
        <div className="px-4">
          <Link
            href="/bookings"
            className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-[#f2800d] text-[#f2800d] font-bold"
          >
            View My Bookings
          </Link>
        </div>
        <SearchBar placeholder="Search barbers, styles, location..." />
        <HeroBanner />
        <FilterChips />
        <section className="px-4">
          <h2 className="text-lg font-bold mb-2">Top Barbers Nearby</h2>
          {loading && (
            <p className="text-sm text-gray-500">Loading barbers...</p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4">
            {!loading &&
              !error &&
              barbers.map((barber) => {
                const location =
                  barber.address?.trim() ||
                  [barber.state, barber.country].filter(Boolean).join(", ");
                const charge = barber.charge ? Number(barber.charge) : null;

                return (
                  <BarberCard
                    key={barber._id}
                    name={barber.name}
                    location={location}
                    price={Number.isNaN(charge) ? null : charge}
                    image={barber.avatar || ""}
                    href={`/book?barberId=${barber._id}`}
                  />
                );
              })}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
