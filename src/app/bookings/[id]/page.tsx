"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HeaderBack from "@/components/ui/HeaderBack";
import DetailRow from "@/components/ui/DetailRow";
import { Calendar, Clock, MapPin, Scissors, User } from "lucide-react";

type BookingDetail = {
  _id: string;
  service: string;
  services?: { name: string; price?: number; durationMinutes?: number }[];
  dateTime: string;
  address?: string;
  status?: string;
  paymentStatus?: string;
  clientId?: { name?: string; email?: string };
  barberId?: { userId?: { name?: string; email?: string } };
};

/**
 * AUTO-FUNCTION-COMMENT: BookingDetailsPage
 * Purpose: Handles booking details page.
 * Line-by-line:
 * 1. Executes `const params = useParams<{ id: string }>();`.
 * 2. Executes `const id = typeof params?.id === "string" ? params.id : "";`.
 * 3. Executes `const router = useRouter();`.
 * 4. Executes `const { data: session } = useSession();`.
 * 5. Executes `const [booking, setBooking] = useState<BookingDetail | null>(null);`.
 * 6. Executes `const [loading, setLoading] = useState(true);`.
 * 7. Executes `const [error, setError] = useState<string | null>(null);`.
 * 8. Executes `const [actionLoading, setActionLoading] = useState(false);`.
 * 9. Executes `const [dateTime, setDateTime] = useState("");`.
 * 10. Executes `useEffect(() => {`.
 * 11. Executes `if (!id) {`.
 * 12. Executes `setError("Missing booking id");`.
 * 13. Executes `setLoading(false);`.
 * 14. Executes `return;`.
 * 15. Executes `}`.
 * 16. Executes `const loadBooking = async () => {`.
 * 17. Executes `try {`.
 * 18. Executes `const res = await fetch(\`/api/bookings/${id}\`);`.
 * 19. Executes `const json = await res.json();`.
 * 20. Executes `if (!res.ok) {`.
 * 21. Executes `throw new Error(json.error ?? "Failed to load booking");`.
 * 22. Executes `}`.
 * 23. Executes `setBooking(json.booking);`.
 * 24. Executes `setDateTime(json.booking?.dateTime ? json.booking.dateTime.slice(0, 16) : "");`.
 * 25. Executes `} catch (err) {`.
 * 26. Executes `setError(err instanceof Error ? err.message : "Failed to load booking");`.
 * 27. Executes `} finally {`.
 * 28. Executes `setLoading(false);`.
 * 29. Executes `}`.
 * 30. Executes `};`.
 * 31. Executes `loadBooking();`.
 * 32. Executes `}, [id]);`.
 * 33. Executes `const isBarber = session?.user?.role === "barber";`.
 * 34. Executes `const isClient = session?.user?.role === "client";`.
 * 35. Executes `const servicesLabel = useMemo(() => {`.
 * 36. Executes `if (booking?.services?.length) {`.
 * 37. Executes `return booking.services.map((s) => s.name).join(", ");`.
 * 38. Executes `}`.
 * 39. Executes `return booking?.service ?? "";`.
 * 40. Executes `}, [booking]);`.
 * 41. Executes `const updateBooking = async (data: Record<string, unknown>) => {`.
 * 42. Executes `setActionLoading(true);`.
 * 43. Executes `try {`.
 * 44. Executes `const res = await fetch(\`/api/bookings/${id}\`, {`.
 * 45. Executes `method: "PUT",`.
 * 46. Executes `headers: { "Content-Type": "application/json" },`.
 * 47. Executes `body: JSON.stringify(data),`.
 * 48. Executes `});`.
 * 49. Executes `const json = await res.json();`.
 * 50. Executes `if (!res.ok) {`.
 * 51. Executes `throw new Error(json.error ?? "Failed to update booking");`.
 * 52. Executes `}`.
 * 53. Executes `setBooking(json.booking);`.
 * 54. Executes `} catch (err) {`.
 * 55. Executes `setError(err instanceof Error ? err.message : "Failed to update booking");`.
 * 56. Executes `} finally {`.
 * 57. Executes `setActionLoading(false);`.
 * 58. Executes `}`.
 * 59. Executes `};`.
 * 60. Executes `return (`.
 * 61. Executes `<div className="min-h-screen bg-white">`.
 * 62. Executes `<HeaderBack title="Booking Details" />`.
 * 63. Executes `{loading && <p className="px-4 py-6 text-sm text-gray-500">Loading...</p>}`.
 * 64. Executes `{!loading && error && (`.
 * 65. Executes `<p className="px-4 py-6 text-sm text-red-600">{error}</p>`.
 * 66. Executes `)}`.
 * 67. Executes `{!loading && !error && booking && (`.
 * 68. Executes `<div className="pb-10">`.
 * 69. Executes `<DetailRow icon={<Scissors size={24} />} label="Service" value={servicesLabel} />`.
 * 70. Executes `<DetailRow`.
 * 71. Executes `icon={<Calendar size={24} />}`.
 * 72. Executes `label="Date"`.
 * 73. Executes `value={new Date(booking.dateTime).toLocaleDateString()}`.
 * 74. Executes `/>`.
 * 75. Executes `<DetailRow`.
 * 76. Executes `icon={<Clock size={24} />}`.
 * 77. Executes `label="Time"`.
 * 78. Executes `value={new Date(booking.dateTime).toLocaleTimeString()}`.
 * 79. Executes `/>`.
 * 80. Executes `<DetailRow icon={<MapPin size={24} />} label="Address" value={booking.address || "Not provided"} />`.
 * 81. Executes `<DetailRow icon={<User size={24} />} label="Barber" value={booking.barberId?.userId?.email || "Unknown"} />`.
 * 82. Executes `<DetailRow icon={<User size={24} />} label="Client" value={booking.clientId?.email || "Unknown"} />`.
 * 83. Executes `<DetailRow icon={<User size={24} />} label="Status" value={booking.status || "pending"} />`.
 * 84. Executes `<DetailRow`.
 * 85. Executes `icon={<User size={24} />}`.
 * 86. Executes `label="Payment"`.
 * 87. Executes `value={booking.paymentStatus || "pending"}`.
 * 88. Executes `/>`.
 * 89. Executes `{isBarber && (`.
 * 90. Executes `<div className="px-4 pt-6 space-y-3">`.
 * 91. Executes `<div className="flex gap-3">`.
 * 92. Executes `<button`.
 * 93. Executes `className="flex-1 h-11 rounded-lg bg-green-600 text-white font-bold"`.
 * 94. Executes `onClick={() => updateBooking({ status: "confirmed" })}`.
 * 95. Executes `disabled={actionLoading}`.
 * 96. Executes `>`.
 * 97. Executes `Accept`.
 * 98. Executes `</button>`.
 * 99. Executes `<button`.
 * 100. Executes `className="flex-1 h-11 rounded-lg bg-red-600 text-white font-bold"`.
 * 101. Executes `onClick={() => updateBooking({ status: "declined" })}`.
 * 102. Executes `disabled={actionLoading}`.
 * 103. Executes `>`.
 * 104. Executes `Decline`.
 * 105. Executes `</button>`.
 * 106. Executes `</div>`.
 * 107. Executes `<div className="space-y-2">`.
 * 108. Executes `<label className="text-sm font-medium text-gray-600">`.
 * 109. Executes `Reschedule`.
 * 110. Executes `</label>`.
 * 111. Executes `<div className="flex gap-2">`.
 * 112. Executes `<input`.
 * 113. Executes `type="datetime-local"`.
 * 114. Executes `className="flex-1 border rounded px-2 py-2"`.
 * 115. Executes `value={dateTime}`.
 * 116. Executes `onChange={(e) => setDateTime(e.target.value)}`.
 * 117. Executes `/>`.
 * 118. Executes `<button`.
 * 119. Executes `className="px-3 py-2 bg-[#f2800d] text-white rounded"`.
 * 120. Executes `onClick={() => updateBooking({ dateTime })}`.
 * 121. Executes `disabled={actionLoading || !dateTime}`.
 * 122. Executes `>`.
 * 123. Executes `Update`.
 * 124. Executes `</button>`.
 * 125. Executes `</div>`.
 * 126. Executes `</div>`.
 * 127. Executes `<button`.
 * 128. Executes `className="w-full h-11 rounded-lg border border-green-600 text-green-700 font-bold"`.
 * 129. Executes `onClick={() => updateBooking({ status: "completed" })}`.
 * 130. Executes `disabled={actionLoading}`.
 * 131. Executes `>`.
 * 132. Executes `End Booking`.
 * 133. Executes `</button>`.
 * 134. Executes `</div>`.
 * 135. Executes `)}`.
 * 136. Executes `<div className="px-4 py-6">`.
 * 137. Executes `<div className="space-y-3">`.
 * 138. Executes `{isClient && booking.paymentStatus !== "paid" && (`.
 * 139. Executes `<button`.
 * 140. Executes `className="w-full h-12 rounded-lg bg-[#f2800d] text-white font-bold"`.
 * 141. Executes `onClick={() => router.push(\`/checkout/${id}\`)}`.
 * 142. Executes `>`.
 * 143. Executes `Pay Now`.
 * 144. Executes `</button>`.
 * 145. Executes `)}`.
 * 146. Executes `<button`.
 * 147. Executes `className="w-full h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold"`.
 * 148. Executes `onClick={() => router.back()}`.
 * 149. Executes `>`.
 * 150. Executes `Back`.
 * 151. Executes `</button>`.
 * 152. Executes `</div>`.
 * 153. Executes `</div>`.
 * 154. Executes `</div>`.
 * 155. Executes `)}`.
 * 156. Executes `</div>`.
 * 157. Executes `);`.
 */
export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Missing booking id");
      setLoading(false);
      return;
    }

    /**
     * AUTO-FUNCTION-COMMENT: loadBooking
     * Purpose: Handles load booking.
     * Line-by-line:
     * 1. Executes `try {`.
     * 2. Executes `const res = await fetch(\`/api/bookings/${id}\`);`.
     * 3. Executes `const json = await res.json();`.
     * 4. Executes `if (!res.ok) {`.
     * 5. Executes `throw new Error(json.error ?? "Failed to load booking");`.
     * 6. Executes `}`.
     * 7. Executes `setBooking(json.booking);`.
     * 8. Executes `setDateTime(json.booking?.dateTime ? json.booking.dateTime.slice(0, 16) : "");`.
     * 9. Executes `} catch (err) {`.
     * 10. Executes `setError(err instanceof Error ? err.message : "Failed to load booking");`.
     * 11. Executes `} finally {`.
     * 12. Executes `setLoading(false);`.
     * 13. Executes `}`.
     */
    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load booking");
        }
        setBooking(json.booking);
        setDateTime(json.booking?.dateTime ? json.booking.dateTime.slice(0, 16) : "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const isBarber = session?.user?.role === "barber";
  const isClient = session?.user?.role === "client";

  const servicesLabel = useMemo(() => {
    if (booking?.services?.length) {
      return booking.services.map((s) => s.name).join(", ");
    }
    return booking?.service ?? "";
  }, [booking]);

  /**
   * AUTO-FUNCTION-COMMENT: updateBooking
   * Purpose: Handles update booking.
   * Line-by-line:
   * 1. Executes `setActionLoading(true);`.
   * 2. Executes `try {`.
   * 3. Executes `const res = await fetch(\`/api/bookings/${id}\`, {`.
   * 4. Executes `method: "PUT",`.
   * 5. Executes `headers: { "Content-Type": "application/json" },`.
   * 6. Executes `body: JSON.stringify(data),`.
   * 7. Executes `});`.
   * 8. Executes `const json = await res.json();`.
   * 9. Executes `if (!res.ok) {`.
   * 10. Executes `throw new Error(json.error ?? "Failed to update booking");`.
   * 11. Executes `}`.
   * 12. Executes `setBooking(json.booking);`.
   * 13. Executes `} catch (err) {`.
   * 14. Executes `setError(err instanceof Error ? err.message : "Failed to update booking");`.
   * 15. Executes `} finally {`.
   * 16. Executes `setActionLoading(false);`.
   * 17. Executes `}`.
   */
  const updateBooking = async (data: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to update booking");
      }
      setBooking(json.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderBack title="Booking Details" />

      {loading && <p className="px-4 py-6 text-sm text-gray-500">Loading...</p>}
      {!loading && error && (
        <p className="px-4 py-6 text-sm text-red-600">{error}</p>
      )}
      {!loading && !error && booking && (
        <div className="pb-10">
          <DetailRow icon={<Scissors size={24} />} label="Service" value={servicesLabel} />
          <DetailRow
            icon={<Calendar size={24} />}
            label="Date"
            value={new Date(booking.dateTime).toLocaleDateString()}
          />
          <DetailRow
            icon={<Clock size={24} />}
            label="Time"
            value={new Date(booking.dateTime).toLocaleTimeString()}
          />
          <DetailRow icon={<MapPin size={24} />} label="Address" value={booking.address || "Not provided"} />
          <DetailRow icon={<User size={24} />} label="Barber" value={booking.barberId?.userId?.email || "Unknown"} />
          <DetailRow icon={<User size={24} />} label="Client" value={booking.clientId?.email || "Unknown"} />
          <DetailRow icon={<User size={24} />} label="Status" value={booking.status || "pending"} />
          <DetailRow
            icon={<User size={24} />}
            label="Payment"
            value={booking.paymentStatus || "pending"}
          />

          {isBarber && (
            <div className="px-4 pt-6 space-y-3">
              <div className="flex gap-3">
                <button
                  className="flex-1 h-11 rounded-lg bg-green-600 text-white font-bold"
                  onClick={() => updateBooking({ status: "confirmed" })}
                  disabled={actionLoading}
                >
                  Accept
                </button>
                <button
                  className="flex-1 h-11 rounded-lg bg-red-600 text-white font-bold"
                  onClick={() => updateBooking({ status: "declined" })}
                  disabled={actionLoading}
                >
                  Decline
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Reschedule
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    className="flex-1 border rounded px-2 py-2"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                  <button
                    className="px-3 py-2 bg-[#f2800d] text-white rounded"
                    onClick={() => updateBooking({ dateTime })}
                    disabled={actionLoading || !dateTime}
                  >
                    Update
                  </button>
                </div>
              </div>

              <button
                className="w-full h-11 rounded-lg border border-green-600 text-green-700 font-bold"
                onClick={() => updateBooking({ status: "completed" })}
                disabled={actionLoading}
              >
                End Booking
              </button>
            </div>
          )}

          <div className="px-4 py-6">
            <div className="space-y-3">
              {isClient && booking.paymentStatus !== "paid" && (
                <button
                  className="w-full h-12 rounded-lg bg-[#f2800d] text-white font-bold"
                  onClick={() => router.push(`/checkout/${id}`)}
                >
                  Pay Now
                </button>
              )}
              <button
                className="w-full h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold"
                onClick={() => router.back()}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
