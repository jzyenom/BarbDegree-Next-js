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
