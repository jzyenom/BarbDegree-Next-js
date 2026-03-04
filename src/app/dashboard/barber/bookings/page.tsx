"use client";

import { useEffect, useState } from "react";
import BarberHeader from "@/components/Barber/BarberHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings, updateBooking } from "@/features/bookings/bookingsSlice";
import Link from "next/link";
import BottomNav, { barberNavItems } from "@/components/BottomNav";

export default function BarberBookingsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.bookings);
  const [changes, setChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleReschedule = (id: string) => {
    const dateTime = changes[id];
    if (!dateTime) return;
    dispatch(updateBooking({ id, data: { dateTime } }));
  };

  const handleDecline = (id: string) => {
    dispatch(updateBooking({ id, data: { status: "declined" } }));
  };

  const handleComplete = (id: string) => {
    dispatch(updateBooking({ id, data: { status: "completed" } }));
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <BarberHeader title="Bookings" />

      <div className="p-4 space-y-4">
        {loading && <p>Loading bookings...</p>}
        {!loading && items.length === 0 && <p>No bookings yet.</p>}

        {!loading &&
          items.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-3 space-y-2">
              <Link href={`/bookings/${booking._id}`} className="font-semibold block">
                {booking.service}
              </Link>
              <div className="text-sm text-gray-500">
                {new Date(booking.dateTime).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Status: {booking.status || "pending"}
              </div>
              <div className="text-sm text-gray-500">
                Client: {(booking as any).clientId?.name || "Unknown"}
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1"
                  value={changes[booking._id] || ""}
                  onChange={(e) =>
                    setChanges({ ...changes, [booking._id]: e.target.value })
                  }
                />
                <button
                  className="px-3 py-1 bg-[#f2800d] text-white rounded"
                  onClick={() => handleReschedule(booking._id)}
                >
                  Reschedule
                </button>
                <button
                  className="px-3 py-1 border text-red-600 rounded"
                  onClick={() => handleDecline(booking._id)}
                >
                  Decline
                </button>
                <button
                  className="px-3 py-1 border text-green-600 rounded"
                  onClick={() => handleComplete(booking._id)}
                >
                  End Booking
                </button>
              </div>
            </div>
          ))}
      </div>
      <BottomNav items={barberNavItems} activeItem="Bookings" />
    </div>
  );
}
