"use client";

import { useEffect, useState } from "react";
import BarberHeader from "@/components/Barber/BarberHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings, updateBooking } from "@/features/bookings/bookingsSlice";
import Link from "next/link";
import BottomNav, { barberNavItems } from "@/components/BottomNav";


function getDisplayName(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    value.name.trim()
  ) {
    return value.name;
  }
  return fallback;
}


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
    <div className="mobile-screen mobile-shell flex flex-col bg-white">
      <BarberHeader title="Bookings" />

      <div className="mobile-scroll space-y-3 p-4 pb-20">
        {loading && <p>Loading bookings...</p>}
        {!loading && items.length === 0 && <p>No bookings yet.</p>}

        {!loading &&
          items.map((booking) => (
            <div key={booking._id} className="space-y-2 rounded-lg border p-3">
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
                Payment: {booking.paymentStatus || "pending"}
              </div>
              <div className="text-sm text-gray-500">
                Client: {getDisplayName(booking.clientId, "Unknown")}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* show an input field */}
                <input
                  type="datetime-local"
                  className="col-span-2 rounded border px-2 py-1 text-sm"
                  value={changes[booking._id] || ""}
                  onChange={(e) =>
                    setChanges({ ...changes, [booking._id]: e.target.value })
                  }
                />
                <button
                  className="rounded bg-[#f2800d] px-2 py-1 text-sm text-white"
                  onClick={() => handleReschedule(booking._id)}
                >
                  Reschedule
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm text-red-600"
                  onClick={() => handleDecline(booking._id)}
                  disabled={booking.paymentStatus === "paid"}
                >
                  Decline
                </button>
                <button
                  className="col-span-2 rounded border px-2 py-1 text-sm text-green-600"
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
