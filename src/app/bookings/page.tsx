"use client";

import { useEffect } from "react";
import Link from "next/link";
import HeaderBack from "@/components/ui/HeaderBack";
import BottomNav from "@/components/BottomNav";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings } from "@/features/bookings/bookingsSlice";


export default function ClientBookingsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  return (
    <div className="mobile-screen mobile-shell flex flex-col bg-white">
      <HeaderBack title="My Bookings" />

      <div className="mobile-scroll space-y-3 p-4 pb-20">
        {loading && <p>Loading bookings...</p>}
        {!loading && items.length === 0 && <p>No bookings yet.</p>}

        {!loading &&
          items.map((booking) => (
            <div key={booking._id} className="space-y-1 rounded-lg border p-3">
              <Link href={`/bookings/${booking._id}`} className="font-semibold block">
                {booking.service}
              </Link>
              <div className="text-sm text-gray-500">
                {new Date(booking.dateTime).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Status: {booking.status || "pending"}
              </div>
            </div>
          ))}
      </div>
      <BottomNav activeItem="Bookings" />
    </div>
  );
}
