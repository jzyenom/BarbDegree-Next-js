"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import HeaderBack from "@/components/ui/HeaderBack";
import DetailRow from "@/components/ui/DetailRow";
import BottomNav from "@/components/ui/BottomNav";
import ButtonRow from "@/components/ui/ButtonRow";
import { Scissors, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { formatNaira } from "@/lib/format";

type BookingPayload = {
  barberId: string;
  name: string;
  email: string;
  address?: string;
  service: string;
  dateTime: string;
  note?: string;
  estimatedPrice?: number;
};

export default function ConfirmBookingPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Obtain booking data from searchParams or from elsewhere (state, context)
  // We'll read from searchParams if sent from previous route:
  // e.g. /book/confirm?barberId=...&service=Men%27s%20Haircut&dateTime=...&price=3000
  const payload: BookingPayload = {
    barberId: searchParams?.barberId || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    address: searchParams?.address || "",
    service: searchParams?.service || "Service",
    dateTime: searchParams?.dateTime || new Date().toISOString(),
    estimatedPrice: searchParams?.price ? Number(searchParams.price) : 0,
  };

  async function handleConfirmAndPay() {
    if (!session?.user?.id) {
      setMessage("You must be signed in to confirm booking.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // 1) Create booking (server uses session to set clientId)
      const createRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: payload.barberId,
          name: payload.name,
          email: payload.email,
          address: payload.address,
          service: payload.service,
          dateTime: payload.dateTime,
          estimatedPrice: payload.estimatedPrice,
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Create failed");

      const booking = createJson.booking;
      setMessage("Booking created. Redirecting to payment...");

      // 2) Initiate Paystack flow (initiate route returns authUrl)
      const initRes = await fetch("/api/paystack/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking._id }),
      });
      const initJson = await initRes.json();
      if (!initRes.ok) throw new Error(initJson?.error || "Failed to initiate payment");

      const { authUrl } = initJson;
      if (authUrl) {
        // redirect to Paystack payment page
        window.location.href = authUrl;
      } else {
        setMessage("Could not get payment URL. Payment can be verified from transactions.");
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmWithoutPay() {
    if (!session?.user?.id) {
      setMessage("You must be signed in to confirm booking.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const createRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: payload.barberId,
          name: payload.name,
          email: payload.email,
          address: payload.address,
          service: payload.service,
          dateTime: payload.dateTime,
          estimatedPrice: payload.estimatedPrice,
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Create failed");

      setMessage("Booking created (pending payment). You can pay later from Transactions.");
      // redirect to transactions after a short delay
      setTimeout(() => router.push("/transactions"), 800);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <HeaderBack title="Booking Confirmation" />

        <h2 className="text-[#181411] text-[22px] font-bold px-4 pt-5 pb-3">Service Details</h2>

        <DetailRow icon={<Scissors size={24} />} label="Service" value={payload.service} />
        <DetailRow icon={<Calendar size={24} />} label="Date" value={new Date(payload.dateTime).toLocaleDateString()} />
        <DetailRow icon={<Clock size={24} />} label="Time" value={new Date(payload.dateTime).toLocaleTimeString()} />
        <DetailRow icon={<MapPin size={24} />} label="Address" value={payload.address || "Not provided"} />
        <DetailRow icon={<DollarSign size={24} />} label="Estimated Price" value={formatNaira(payload.estimatedPrice)} />
      </div>

      <div>
        <div className="px-4 py-3">
          <div className="flex gap-3">
            <button
              className="flex-1 h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold"
              onClick={() => router.back()}
              disabled={loading}
            >
              Edit
            </button>

            <div className="flex-1 grid grid-cols-2 gap-3">
              <button
                className="h-12 rounded-lg bg-white border border-[#f2800d] text-[#f2800d] font-bold"
                onClick={handleConfirmWithoutPay}
                disabled={loading}
              >
                Confirm (No Pay)
              </button>
              <button
                className="h-12 rounded-lg bg-[#f2800d] text-white font-bold"
                onClick={handleConfirmAndPay}
                disabled={loading}
              >
                {loading ? "Processing…" : "Confirm & Pay"}
              </button>
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-center text-[#8a7560]">{message}</p>}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}


// 2026 Updated Booking Confirmation Page
// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// type BookingDraft = {
//   name: string;
//   email: string;
//   address: string;
//   service: string;
//   dateTime: string;
//   note: string;
//   clientEmail?: string;
//   barberId: string;
//   estimatedPrice: number;
// };

// export default function ConfirmBooking() {
//   const router = useRouter();
//   const [booking, setBooking] = useState<BookingDraft | null>(null);
//   const [loading, setLoading] = useState(false);

//   // useEffect(() => {
//   //   const draft = sessionStorage.getItem("bookingDraft");
//   //   if (!draft) return router.push("/book"); // redirect if none

//   //   setBooking(JSON.parse(draft));
//   // }, [router]);

//   const handleConfirm = async () => {
//     if (!booking) return;

//     setLoading(true);
//     try {
//       await axios.post("/api/bookings", booking);

//       // clear draft
//       sessionStorage.removeItem("bookingDraft");

//       alert("Booking confirmed!");
//       router.push("/bookings");
//     } catch (error) {
//       console.error(error);
//       alert("Booking failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!booking) return <div>Loading...</div>;

//   return (
//     <div className="min-h-screen bg-white flex flex-col justify-between">
//       {/* your UI here */}
//       <div className="p-4">
//         <h2 className="text-lg font-bold">Booking Confirmation</h2>

//         <div className="mt-4">
//           <p><strong>Service:</strong> {booking.service}</p>
//           <p><strong>Date:</strong> {booking.dateTime}</p>
//           <p><strong>Price:</strong> ${booking.estimatedPrice}</p>
//         </div>
//       </div>

//       <div className="p-4 flex gap-3">
//         <button
//           className="flex-1 rounded-lg h-12 bg-[#f5f2f0] text-[#181411] font-bold"
//           onClick={() => router.back()}
//         >
//           Edit
//         </button>

//         <button
//           className="flex-1 rounded-lg h-12 bg-[#f2800d] text-[#181411] font-bold"
//           onClick={handleConfirm}
//           disabled={loading}
//         >
//           {loading ? "Confirming..." : "Confirm Booking"}
//         </button>
//       </div>
//     </div>
//   );
// }