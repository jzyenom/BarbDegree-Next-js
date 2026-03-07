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

/**
 * AUTO-FUNCTION-COMMENT: BarberBookingsPage
 * Purpose: Handles barber bookings page.
 * Line-by-line:
 * 1. Executes `const dispatch = useAppDispatch();`.
 * 2. Executes `const { items, loading } = useAppSelector((state) => state.bookings);`.
 * 3. Executes `const [changes, setChanges] = useState<Record<string, string>>({});`.
 * 4. Executes `useEffect(() => {`.
 * 5. Executes `dispatch(fetchBookings());`.
 * 6. Executes `}, [dispatch]);`.
 * 7. Executes `const handleReschedule = (id: string) => {`.
 * 8. Executes `const dateTime = changes[id];`.
 * 9. Executes `if (!dateTime) return;`.
 * 10. Executes `dispatch(updateBooking({ id, data: { dateTime } }));`.
 * 11. Executes `};`.
 * 12. Executes `const handleDecline = (id: string) => {`.
 * 13. Executes `dispatch(updateBooking({ id, data: { status: "declined" } }));`.
 * 14. Executes `};`.
 * 15. Executes `const handleComplete = (id: string) => {`.
 * 16. Executes `dispatch(updateBooking({ id, data: { status: "completed" } }));`.
 * 17. Executes `};`.
 * 18. Executes `return (`.
 * 19. Executes `<div className="min-h-screen bg-white pb-24">`.
 * 20. Executes `<BarberHeader title="Bookings" />`.
 * 21. Executes `<div className="p-4 space-y-4">`.
 * 22. Executes `{loading && <p>Loading bookings...</p>}`.
 * 23. Executes `{!loading && items.length === 0 && <p>No bookings yet.</p>}`.
 * 24. Executes `{!loading &&`.
 * 25. Executes `items.map((booking) => (`.
 * 26. Executes `<div key={booking._id} className="border rounded-lg p-3 space-y-2">`.
 * 27. Executes `<Link href={\`/bookings/${booking._id}\`} className="font-semibold block">`.
 * 28. Executes `{booking.service}`.
 * 29. Executes `</Link>`.
 * 30. Executes `<div className="text-sm text-gray-500">`.
 * 31. Executes `{new Date(booking.dateTime).toLocaleString()}`.
 * 32. Executes `</div>`.
 * 33. Executes `<div className="text-sm text-gray-500">`.
 * 34. Executes `Status: {booking.status || "pending"}`.
 * 35. Executes `</div>`.
 * 36. Executes `<div className="text-sm text-gray-500">`.
 * 37. Executes `Client: {(booking as any).clientId?.name || "Unknown"}`.
 * 38. Executes `</div>`.
 * 39. Executes `<div className="flex gap-2 items-center">`.
 * 40. Executes `<input`.
 * 41. Executes `type="datetime-local"`.
 * 42. Executes `className="border rounded px-2 py-1"`.
 * 43. Executes `value={changes[booking._id] || ""}`.
 * 44. Executes `onChange={(e) =>`.
 * 45. Executes `setChanges({ ...changes, [booking._id]: e.target.value })`.
 * 46. Executes `}`.
 * 47. Executes `/>`.
 * 48. Executes `<button`.
 * 49. Executes `className="px-3 py-1 bg-[#f2800d] text-white rounded"`.
 * 50. Executes `onClick={() => handleReschedule(booking._id)}`.
 * 51. Executes `>`.
 * 52. Executes `Reschedule`.
 * 53. Executes `</button>`.
 * 54. Executes `<button`.
 * 55. Executes `className="px-3 py-1 border text-red-600 rounded"`.
 * 56. Executes `onClick={() => handleDecline(booking._id)}`.
 * 57. Executes `>`.
 * 58. Executes `Decline`.
 * 59. Executes `</button>`.
 * 60. Executes `<button`.
 * 61. Executes `className="px-3 py-1 border text-green-600 rounded"`.
 * 62. Executes `onClick={() => handleComplete(booking._id)}`.
 * 63. Executes `>`.
 * 64. Executes `End Booking`.
 * 65. Executes `</button>`.
 * 66. Executes `</div>`.
 * 67. Executes `</div>`.
 * 68. Executes `))}`.
 * 69. Executes `</div>`.
 * 70. Executes `<BottomNav items={barberNavItems} activeItem="Bookings" />`.
 * 71. Executes `</div>`.
 * 72. Executes `);`.
 */
export default function BarberBookingsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.bookings);
  const [changes, setChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  /**
   * AUTO-FUNCTION-COMMENT: handleReschedule
   * Purpose: Handles handle reschedule.
   * Line-by-line:
   * 1. Executes `const dateTime = changes[id];`.
   * 2. Executes `if (!dateTime) return;`.
   * 3. Executes `dispatch(updateBooking({ id, data: { dateTime } }));`.
   */
  const handleReschedule = (id: string) => {
    const dateTime = changes[id];
    if (!dateTime) return;
    dispatch(updateBooking({ id, data: { dateTime } }));
  };

  /**
   * AUTO-FUNCTION-COMMENT: handleDecline
   * Purpose: Handles handle decline.
   * Line-by-line:
   * 1. Executes `dispatch(updateBooking({ id, data: { status: "declined" } }));`.
   */
  const handleDecline = (id: string) => {
    dispatch(updateBooking({ id, data: { status: "declined" } }));
  };

  /**
   * AUTO-FUNCTION-COMMENT: handleComplete
   * Purpose: Handles handle complete.
   * Line-by-line:
   * 1. Executes `dispatch(updateBooking({ id, data: { status: "completed" } }));`.
   */
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
                Client: {getDisplayName(booking.clientId, "Unknown")}
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
