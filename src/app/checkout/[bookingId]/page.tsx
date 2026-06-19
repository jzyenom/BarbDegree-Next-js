"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HeaderBack from "@/components/ui/HeaderBack";
import DetailRow from "@/components/ui/DetailRow";
import BottomNav from "@/components/ui/BottomNav";
import { Calendar, Clock, MapPin, Scissors, Wallet } from "lucide-react";
import { formatNaira } from "@/lib/format";

type CheckoutBooking = {
  _id: string;
  service: string;
  dateTime: string;
  address?: string;
  estimatedPrice?: number;
  amountPaid?: number;
  paymentStatus?: "pending" | "paid" | "failed";
  status?: string;
  clientId?: { name?: string; email?: string };
  barberId?: { userId?: { name?: string; email?: string } };
};


export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId;

  const [booking, setBooking] = useState<CheckoutBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId || status === "loading") return;

    let mounted = true;

    
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load booking");
        }
        if (mounted) setBooking(json.booking);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load booking");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [bookingId, status]);

  
  async function handlePayNow() {
    if (!bookingId) return;

    setPaying(true);
    setError(null);
    setMessage("Initializing secure checkout...");

    try {
      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to start payment");
      }

      if (!json.authUrl) {
        throw new Error("Missing payment authorization URL");
      }

      window.location.href = json.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initialization failed");
      setMessage(null);
      setPaying(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-white p-6">Loading checkout...</div>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white p-6">
        {/* show text */}
        <p className="font-semibold">Please sign in to continue to checkout.</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderBack title="Checkout" />
        <div className="px-4 py-6">
          {/* show text */}
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderBack title="Checkout" />
        <div className="px-4 py-6">
          {/* show text */}
          <p className="text-sm text-gray-500">Booking not found.</p>
        </div>
      </div>
    );
  }

  const barberName =
    booking.barberId?.userId?.name || booking.barberId?.userId?.email || "Barber";
  const payableAmount = booking.amountPaid || booking.estimatedPrice || 0;
  const isPaid = booking.paymentStatus === "paid";
  const canPay = booking.status === "confirmed" && !isPaid;

  return (
    <div className="mobile-screen mobile-shell flex flex-col bg-white">
      <div className="mobile-scroll pb-20">
        <HeaderBack title="Checkout" />

        <div className="px-4 pb-1 pt-3">
          <h2 className="text-lg font-bold text-[#181411]">Review & Pay</h2>
          {/* show text */}
          <p className="text-sm text-[#8a7560] mt-1">
            Payment opens after the barber accepts the booking.
          </p>
        </div>

        <div className="px-4 py-2">
          <div className="rounded-2xl border border-[#f0e8e0] bg-[#fcfaf8] p-3">
            {/* show text */}
            <p className="text-sm text-[#8a7560]">Booking ID</p>
            {/* show text */}
            <p className="font-medium break-all">{booking._id}</p>
            {/* show text */}
            <p className="text-sm text-[#8a7560] mt-3">Barber</p>
            {/* show text */}
            <p className="font-medium">{barberName}</p>
          </div>
        </div>

        <DetailRow icon={<Scissors size={24} />} label="Service" value={booking.service} />
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
        <DetailRow icon={<Wallet size={24} />} label="Amount" value={formatNaira(payableAmount)} />

        <div className="px-4 pt-2">
          <div className="rounded-xl border border-[#f0e8e0] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              {/* show inline text */}
              <span className="text-sm text-[#8a7560]">Booking Status</span>
              {/* show inline text */}
              <span className="text-sm font-medium">{booking.status || "pending"}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              {/* show inline text */}
              <span className="text-sm text-[#8a7560]">Payment Status</span>
              {/* show inline text */}
              <span
                className={`text-sm font-medium ${
                  isPaid ? "text-green-700" : "text-[#f2800d]"
                }`}
              >
                {booking.paymentStatus || "pending"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          // show text
          <p className="px-4 pt-4 text-sm text-red-600">{error}</p>
        )}
        {message && (
          // show text
          <p className="px-4 pt-4 text-sm text-[#8a7560]">{message}</p>
        )}

        <div className="px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              className="h-11 rounded-lg bg-[#f5f2f0] text-xs font-bold text-[#181411]"
              onClick={() => router.push(`/bookings/${booking._id}`)}
              disabled={paying}
            >
              Pay Later
            </button>
            <button
              className="h-11 rounded-lg border border-[#f2800d] text-xs font-bold text-[#f2800d]"
              onClick={() => router.push("/transactions")}
              disabled={paying}
            >
              Transactions
            </button>
            <button
              className="h-11 rounded-lg bg-[#f2800d] text-xs font-bold text-white disabled:bg-[#f0b67b]"
              onClick={handlePayNow}
              disabled={paying || !canPay}
            >
              {isPaid
                ? "Already Paid"
                : booking.status !== "confirmed"
                  ? "Awaiting Acceptance"
                  : paying
                    ? "Opening Paystack..."
                    : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
      <BottomNav activeItem="Bookings" />
    </div>
  );
}

