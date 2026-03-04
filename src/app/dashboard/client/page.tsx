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

function formatTime(dateValue: string) {
  return new Date(dateValue).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

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
    const barberName =
      (nextBooking.barberId as any)?.name ||
      (nextBooking.barberId as any)?.shopName ||
      "Barber";

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
      const barberName =
        (booking.barberId as any)?.name ||
        (booking.barberId as any)?.shopName ||
        "Barber";

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
