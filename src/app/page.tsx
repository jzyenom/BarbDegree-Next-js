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

/**
 * AUTO-FUNCTION-COMMENT: ClientHome
 * Purpose: Handles client home.
 * Line-by-line:
 * 1. Executes `const { data: session, status } = useSession();`.
 * 2. Executes `const router = useRouter();`.
 * 3. Executes `const [barbers, setBarbers] = useState<BarberListItem[]>([]);`.
 * 4. Executes `const [loading, setLoading] = useState(true);`.
 * 5. Executes `const [error, setError] = useState<string | null>(null);`.
 * 6. Executes `useEffect(() => {`.
 * 7. Executes `if (status === "authenticated" && session?.user?.role) {`.
 * 8. Executes `const role = session.user.role;`.
 * 9. Executes `if (role === "barber" || role === "admin" || role === "superadmin") {`.
 * 10. Executes `router.replace(\`/dashboard/${role}\`);`.
 * 11. Executes `return;`.
 * 12. Executes `}`.
 * 13. Executes `}`.
 * 14. Executes `}, [router, session?.user?.role, status]);`.
 * 15. Executes `useEffect(() => {`.
 * 16. Executes `let mounted = true;`.
 * 17. Executes `const loadBarbers = async () => {`.
 * 18. Executes `try {`.
 * 19. Executes `const res = await fetch("/api/barbers");`.
 * 20. Executes `const json = await res.json();`.
 * 21. Executes `if (!res.ok) {`.
 * 22. Executes `throw new Error(json.error ?? "Failed to load barbers");`.
 * 23. Executes `}`.
 * 24. Executes `if (mounted) {`.
 * 25. Executes `setBarbers(json.barbers ?? []);`.
 * 26. Executes `}`.
 * 27. Executes `} catch (err) {`.
 * 28. Executes `if (mounted) {`.
 * 29. Executes `setError(`.
 * 30. Executes `err instanceof Error ? err.message : "Failed to load barbers"`.
 * 31. Executes `);`.
 * 32. Executes `}`.
 * 33. Executes `} finally {`.
 * 34. Executes `if (mounted) setLoading(false);`.
 * 35. Executes `}`.
 * 36. Executes `};`.
 * 37. Executes `loadBarbers();`.
 * 38. Executes `return () => {`.
 * 39. Executes `mounted = false;`.
 * 40. Executes `};`.
 * 41. Executes `}, []);`.
 * 42. Executes `return (`.
 * 43. Executes `<div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dar...`.
 * 44. Executes `<HomeHeader />`.
 * 45. Executes `<main className="flex flex-col gap-4">`.
 * 46. Executes `<div className="px-4">`.
 * 47. Executes `<Link`.
 * 48. Executes `href="/bookings"`.
 * 49. Executes `className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-[#f2800d] text-[#f2800d] font-bold"`.
 * 50. Executes `>`.
 * 51. Executes `View My Bookings`.
 * 52. Executes `</Link>`.
 * 53. Executes `</div>`.
 * 54. Executes `<SearchBar placeholder="Search barbers, styles, location..." />`.
 * 55. Executes `<HeroBanner />`.
 * 56. Executes `<FilterChips />`.
 * 57. Executes `<section className="px-4">`.
 * 58. Executes `<h2 className="text-lg font-bold mb-2">Top Barbers Nearby</h2>`.
 * 59. Executes `{loading && (`.
 * 60. Executes `<p className="text-sm text-gray-500">Loading barbers...</p>`.
 * 61. Executes `)}`.
 * 62. Executes `{!loading && error && (`.
 * 63. Executes `<p className="text-sm text-red-600">{error}</p>`.
 * 64. Executes `)}`.
 * 65. Executes `<div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4">`.
 * 66. Executes `{!loading &&`.
 * 67. Executes `!error &&`.
 * 68. Executes `barbers.map((barber) => {`.
 * 69. Executes `const location =`.
 * 70. Executes `barber.address?.trim() ||`.
 * 71. Executes `[barber.state, barber.country].filter(Boolean).join(", ");`.
 * 72. Executes `const charge = barber.charge ? Number(barber.charge) : null;`.
 * 73. Executes `return (`.
 * 74. Executes `<BarberCard`.
 * 75. Executes `key={barber._id}`.
 * 76. Executes `name={barber.name}`.
 * 77. Executes `location={location}`.
 * 78. Executes `price={Number.isNaN(charge) ? null : charge}`.
 * 79. Executes `image={barber.avatar || ""}`.
 * 80. Executes `href={\`/book?barberId=${barber._id}\`}`.
 * 81. Executes `/>`.
 * 82. Executes `);`.
 * 83. Executes `})}`.
 * 84. Executes `</div>`.
 * 85. Executes `</section>`.
 * 86. Executes `</main>`.
 * 87. Executes `<BottomNav />`.
 * 88. Executes `</div>`.
 * 89. Executes `);`.
 */
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

    /**
     * AUTO-FUNCTION-COMMENT: loadBarbers
     * Purpose: Handles load barbers.
     * Line-by-line:
     * 1. Executes `try {`.
     * 2. Executes `const res = await fetch("/api/barbers");`.
     * 3. Executes `const json = await res.json();`.
     * 4. Executes `if (!res.ok) {`.
     * 5. Executes `throw new Error(json.error ?? "Failed to load barbers");`.
     * 6. Executes `}`.
     * 7. Executes `if (mounted) {`.
     * 8. Executes `setBarbers(json.barbers ?? []);`.
     * 9. Executes `}`.
     * 10. Executes `} catch (err) {`.
     * 11. Executes `if (mounted) {`.
     * 12. Executes `setError(`.
     * 13. Executes `err instanceof Error ? err.message : "Failed to load barbers"`.
     * 14. Executes `);`.
     * 15. Executes `}`.
     * 16. Executes `} finally {`.
     * 17. Executes `if (mounted) setLoading(false);`.
     * 18. Executes `}`.
     */
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
