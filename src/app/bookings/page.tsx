"use client";

import { useEffect } from "react";
import Link from "next/link";
import HeaderBack from "@/components/ui/HeaderBack";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings } from "@/features/bookings/bookingsSlice";

/**
 * AUTO-FUNCTION-COMMENT: ClientBookingsPage
 * Purpose: Handles client bookings page.
 * Line-by-line:
 * 1. Executes `const dispatch = useAppDispatch();`.
 * 2. Executes `const { items, loading } = useAppSelector((state) => state.bookings);`.
 * 3. Executes `useEffect(() => {`.
 * 4. Executes `dispatch(fetchBookings());`.
 * 5. Executes `}, [dispatch]);`.
 * 6. Executes `return (`.
 * 7. Executes `<div className="min-h-screen bg-white">`.
 * 8. Executes `<HeaderBack title="My Bookings" />`.
 * 9. Executes `<div className="p-4 space-y-4">`.
 * 10. Executes `{loading && <p>Loading bookings...</p>}`.
 * 11. Executes `{!loading && items.length === 0 && <p>No bookings yet.</p>}`.
 * 12. Executes `{!loading &&`.
 * 13. Executes `items.map((booking) => (`.
 * 14. Executes `<div key={booking._id} className="border rounded-lg p-3 space-y-2">`.
 * 15. Executes `<Link href={\`/bookings/${booking._id}\`} className="font-semibold block">`.
 * 16. Executes `{booking.service}`.
 * 17. Executes `</Link>`.
 * 18. Executes `<div className="text-sm text-gray-500">`.
 * 19. Executes `{new Date(booking.dateTime).toLocaleString()}`.
 * 20. Executes `</div>`.
 * 21. Executes `<div className="text-sm text-gray-500">`.
 * 22. Executes `Status: {booking.status || "pending"}`.
 * 23. Executes `</div>`.
 * 24. Executes `</div>`.
 * 25. Executes `))}`.
 * 26. Executes `</div>`.
 * 27. Executes `</div>`.
 * 28. Executes `);`.
 */
export default function ClientBookingsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      <HeaderBack title="My Bookings" />

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
            </div>
          ))}
      </div>
    </div>
  );
}
