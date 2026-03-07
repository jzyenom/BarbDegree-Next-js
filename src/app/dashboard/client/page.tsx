"use client";

import { useEffect, useMemo } from "react";
import { Calendar, Home, User } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import NotificationsBell from "@/components/NotificationsBell";
import BottomNav from "@/components/BottomNav";
import UpcomingCard from "@/components/Client/UpcomingCard";
import RebookCard from "@/components/Client/RebookCard";
import RecommendedRow from "@/components/Client/RecommendedRow";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings } from "@/features/bookings/bookingsSlice";
import { fetchNotifications } from "@/features/notifications/notificationsSlice";

const upcomingFallback = {
  label: "Today",
  title: "Haircut with Alex",
  time: "10:00 AM",
  imageUrl:
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
};

const rebookFallback = [
  {
    title: "Haircut",
    subtitle: "Alex",
    imageUrl:
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Beard Trim",
    subtitle: "Ethan",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Hair Color",
    subtitle: "Noah",
    imageUrl:
      "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop",
  },
];

const recommendedFallback = [
  {
    title: "Haircut with Liam",
    rating: 4.9,
    reviews: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
  },
];

/**
 * AUTO-FUNCTION-COMMENT: formatDayLabel
 * Purpose: Handles format day label.
 * Line-by-line:
 * 1. Executes `const date = new Date(dateValue);`.
 * 2. Executes `const now = new Date();`.
 * 3. Executes `const isSameDay =`.
 * 4. Executes `date.getFullYear() === now.getFullYear() &&`.
 * 5. Executes `date.getMonth() === now.getMonth() &&`.
 * 6. Executes `date.getDate() === now.getDate();`.
 * 7. Executes `const tomorrow = new Date(now);`.
 * 8. Executes `tomorrow.setDate(now.getDate() + 1);`.
 * 9. Executes `const isTomorrow =`.
 * 10. Executes `date.getFullYear() === tomorrow.getFullYear() &&`.
 * 11. Executes `date.getMonth() === tomorrow.getMonth() &&`.
 * 12. Executes `date.getDate() === tomorrow.getDate();`.
 * 13. Executes `if (isSameDay) return "Today";`.
 * 14. Executes `if (isTomorrow) return "Tomorrow";`.
 * 15. Executes `return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });`.
 */
function formatDayLabel(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  if (isSameDay) return "Today";
  if (isTomorrow) return "Tomorrow";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * AUTO-FUNCTION-COMMENT: formatTime
 * Purpose: Handles format time.
 * Line-by-line:
 * 1. Executes `return new Date(dateValue).toLocaleTimeString("en-US", {`.
 * 2. Executes `hour: "numeric",`.
 * 3. Executes `minute: "2-digit",`.
 * 4. Executes `});`.
 */
function formatTime(dateValue: string) {
  return new Date(dateValue).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getBarberDisplayName(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    value.name.trim()
  ) {
    return value.name;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "shopName" in value &&
    typeof value.shopName === "string" &&
    value.shopName.trim()
  ) {
    return value.shopName;
  }
  return "Barber";
}

/**
 * AUTO-FUNCTION-COMMENT: ClientDashboardPage
 * Purpose: Handles client dashboard page.
 * Line-by-line:
 * 1. Executes `const dispatch = useAppDispatch();`.
 * 2. Executes `const { items, loading } = useAppSelector((state) => state.bookings);`.
 * 3. Executes `useEffect(() => {`.
 * 4. Executes `dispatch(fetchBookings());`.
 * 5. Executes `dispatch(fetchNotifications());`.
 * 6. Executes `}, [dispatch]);`.
 * 7. Executes `const upcoming = useMemo(() => {`.
 * 8. Executes `if (!items.length) return null;`.
 * 9. Executes `const now = new Date();`.
 * 10. Executes `const futureBookings = items`.
 * 11. Executes `.filter((booking) => new Date(booking.dateTime) >= now)`.
 * 12. Executes `.sort(`.
 * 13. Executes `(a, b) =>`.
 * 14. Executes `new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()`.
 * 15. Executes `);`.
 * 16. Executes `const nextBooking = futureBookings[0] ?? items[0];`.
 * 17. Executes `const barberName =`.
 * 18. Executes `(nextBooking.barberId as any)?.name ||`.
 * 19. Executes `(nextBooking.barberId as any)?.shopName ||`.
 * 20. Executes `"Barber";`.
 * 21. Executes `return {`.
 * 22. Executes `label: formatDayLabel(nextBooking.dateTime),`.
 * 23. Executes `title: \`${nextBooking.service} with ${barberName}\`,`.
 * 24. Executes `time: formatTime(nextBooking.dateTime),`.
 * 25. Executes `imageUrl: upcomingFallback.imageUrl,`.
 * 26. Executes `};`.
 * 27. Executes `}, [items]);`.
 * 28. Executes `const rebookItems = useMemo(() => {`.
 * 29. Executes `if (!items.length) return rebookFallback;`.
 * 30. Executes `const sorted = [...items].sort(`.
 * 31. Executes `(a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()`.
 * 32. Executes `);`.
 * 33. Executes `return sorted.slice(0, 3).map((booking, index) => {`.
 * 34. Executes `const barberName =`.
 * 35. Executes `(booking.barberId as any)?.name ||`.
 * 36. Executes `(booking.barberId as any)?.shopName ||`.
 * 37. Executes `"Barber";`.
 * 38. Executes `return {`.
 * 39. Executes `title: booking.service,`.
 * 40. Executes `subtitle: barberName,`.
 * 41. Executes `imageUrl: rebookFallback[index]?.imageUrl ?? rebookFallback[0].imageUrl,`.
 * 42. Executes `};`.
 * 43. Executes `});`.
 * 44. Executes `}, [items]);`.
 * 45. Executes `const recommendedItems = recommendedFallback;`.
 * 46. Executes `return (`.
 * 47. Executes `<div className="min-h-screen bg-white text-[#181411] pb-24">`.
 * 48. Executes `<PageHeader`.
 * 49. Executes `title="Home"`.
 * 50. Executes `titleClassName="text-xl"`.
 * 51. Executes `className="pt-6"`.
 * 52. Executes `left={<div className="w-6" />}`.
 * 53. Executes `right={<NotificationsBell />}`.
 * 54. Executes `/>`.
 * 55. Executes `<main className="px-6 pb-6 space-y-10">`.
 * 56. Executes `<section className="space-y-4">`.
 * 57. Executes `<h2 className="text-2xl font-semibold">Upcoming</h2>`.
 * 58. Executes `{loading && <p className="text-sm text-[#8a7560]">Loading...</p>}`.
 * 59. Executes `{!loading && (`.
 * 60. Executes `<UpcomingCard {...(upcoming ?? upcomingFallback)} />`.
 * 61. Executes `)}`.
 * 62. Executes `</section>`.
 * 63. Executes `<section className="space-y-4">`.
 * 64. Executes `<h2 className="text-2xl font-semibold">Rebook</h2>`.
 * 65. Executes `<div className="flex gap-4 overflow-x-auto pb-2">`.
 * 66. Executes `{rebookItems.map((item) => (`.
 * 67. Executes `<RebookCard key={\`${item.title}-${item.subtitle}\`} {...item} />`.
 * 68. Executes `))}`.
 * 69. Executes `</div>`.
 * 70. Executes `</section>`.
 * 71. Executes `<section className="space-y-4">`.
 * 72. Executes `<h2 className="text-2xl font-semibold">Recommended</h2>`.
 * 73. Executes `{recommendedItems.map((item) => (`.
 * 74. Executes `<RecommendedRow key={item.title} {...item} />`.
 * 75. Executes `))}`.
 * 76. Executes `</section>`.
 * 77. Executes `</main>`.
 * 78. Executes `<BottomNav`.
 * 79. Executes `variant="light"`.
 * 80. Executes `activeItem="Home"`.
 * 81. Executes `items={[`.
 * 82. Executes `{ name: "Home", icon: Home, href: "/dashboard/client" },`.
 * 83. Executes `{ name: "Book", icon: Calendar, href: "/book" },`.
 * 84. Executes `{ name: "Profile", icon: User, href: "/profile" },`.
 * 85. Executes `]}`.
 * 86. Executes `/>`.
 * 87. Executes `</div>`.
 * 88. Executes `);`.
 */
export default function ClientDashboardPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const upcoming = useMemo(() => {
    if (!items.length) return null;

    const now = new Date();
    const futureBookings = items
      .filter((booking) => new Date(booking.dateTime) >= now)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );

    const nextBooking = futureBookings[0] ?? items[0];
    const barberName = getBarberDisplayName(nextBooking.barberId);

    return {
      label: formatDayLabel(nextBooking.dateTime),
      title: `${nextBooking.service} with ${barberName}`,
      time: formatTime(nextBooking.dateTime),
      imageUrl: upcomingFallback.imageUrl,
    };
  }, [items]);

  const rebookItems = useMemo(() => {
    if (!items.length) return rebookFallback;
    const sorted = [...items].sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    return sorted.slice(0, 3).map((booking, index) => {
      const barberName = getBarberDisplayName(booking.barberId);

      return {
        title: booking.service,
        subtitle: barberName,
        imageUrl: rebookFallback[index]?.imageUrl ?? rebookFallback[0].imageUrl,
      };
    });
  }, [items]);

  const recommendedItems = recommendedFallback;

  return (
    <div className="min-h-screen bg-white text-[#181411] pb-24">
      <PageHeader
        title="Home"
        titleClassName="text-xl"
        className="pt-6"
        left={<div className="w-6" />}
        right={<NotificationsBell />}
      />

      <main className="px-6 pb-6 space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Upcoming</h2>
          {loading && <p className="text-sm text-[#8a7560]">Loading...</p>}
          {!loading && (
            <UpcomingCard {...(upcoming ?? upcomingFallback)} />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Rebook</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {rebookItems.map((item) => (
              <RebookCard key={`${item.title}-${item.subtitle}`} {...item} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recommended</h2>
          {recommendedItems.map((item) => (
            <RecommendedRow key={item.title} {...item} />
          ))}
        </section>
      </main>

      <BottomNav
        variant="light"
        activeItem="Home"
        items={[
          { name: "Home", icon: Home, href: "/dashboard/client" },
          { name: "Book", icon: Calendar, href: "/book" },
          { name: "Profile", icon: User, href: "/profile" },
        ]}
      />
    </div>
  );
}
