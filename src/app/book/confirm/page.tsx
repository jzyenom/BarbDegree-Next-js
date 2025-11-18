// "use client";
// import HeaderBack from "@/components/ui/HeaderBack";
// import BottomNav from "@/components/ui/BottomNav";
// import ButtonRow from "@/components/ui/ButtonRow";
// import DetailRow from "@/components/ui/DetailRow";

// import { Scissors, Calendar, Clock, MapPin, DollarSign } from "lucide-react";

// export default function ConfirmBookingPage() {
//   return (
//     <div className="min-h-screen flex flex-col justify-between bg-white">
//       <div>
//         <HeaderBack title="Booking Confirmation" />

//         <h2 className="text-[#181411] text-[22px] font-bold px-4 pt-5 pb-3">
//           Service Details
//         </h2>

//         <DetailRow
//           icon={<Scissors size={24} />}
//           label="Service"
//           value="Men's Haircut"
//         />

//         <DetailRow
//           icon={<Calendar size={24} />}
//           label="Date"
//           value="July 20, 2024"
//         />

//         <DetailRow icon={<Clock size={24} />} label="Time" value="10:00 AM" />

//         <DetailRow
//           icon={<MapPin size={24} />}
//           label="Address"
//           value="123 Main St, Anytown"
//         />

//         <DetailRow
//           icon={<DollarSign size={24} />}
//           label="Estimated Price"
//           value="$30"
//         />
//       </div>

//       <div>
//         <ButtonRow
//           onEdit={() => console.log("Edit booking")}
//           onConfirm={() => console.log("Confirm booking")}
//         />
//         <BottomNav />
//         <div className="h-5 bg-white" />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import HeaderBack from "@/components/ui/HeaderBack";
import DetailRow from "@/components/ui/DetailRow";
import ButtonRow from "@/components/ui/ButtonRow";
import BottomNav from "@/components/ui/BottomNav";
import { Scissors, Calendar, Clock, MapPin, DollarSign } from "lucide-react";

interface BookingPayload {
  clientId: string;
  barberId: string;
  name: string;
  email: string;
  address?: string;
  service: string;
  dateTime: string;
  note?: string;
  estimatedPrice?: number;
}

export default function ConfirmBookingPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  // In real app, data will come from previous page / global state / router params / server props
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Demo: Replace these with props or derived state
  const payload: BookingPayload = {
    clientId: "64a...clientId", // replace with real client id (from session)
    barberId: "64b...barberId", // replace with selected barber id
    name: "John Doe",
    email: "john@example.com",
    address: "123 Main St, Anytown",
    service: "Men's Haircut",
    dateTime: "2025-11-20T10:00:00.000Z",
    estimatedPrice: 3000,
  };

  const handleConfirm = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Booking failed");
      setMessage("Booking created successfully");
      // optionally redirect to payment or verification workflow
    } catch (err: any) {
      setMessage(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <HeaderBack title="Booking Confirmation" />
        <h2 className="text-[#181411] text-[22px] font-bold px-4 pt-5 pb-3">
          Service Details
        </h2>

        <DetailRow
          icon={<Scissors size={24} />}
          label="Service"
          value={payload.service}
        />
        <DetailRow
          icon={<Calendar size={24} />}
          label="Date"
          value={new Date(payload.dateTime).toLocaleDateString()}
        />
        <DetailRow
          icon={<Clock size={24} />}
          label="Time"
          value={new Date(payload.dateTime).toLocaleTimeString()}
        />
        <DetailRow
          icon={<MapPin size={24} />}
          label="Address"
          value={payload.address || ""}
        />
        <DetailRow
          icon={<DollarSign size={24} />}
          label="Estimated Price"
          value={`₦${payload.estimatedPrice}`}
        />
      </div>

      <div>
        <div className="px-4 py-3">
          <div className="flex gap-3">
            <button
              className="flex-1 h-12 rounded-lg bg-[#f5f2f0]"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Edit
            </button>
            <button
              className="flex-1 h-12 rounded-lg bg-[#f2800d] text-white"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Saving..." : "Confirm Booking"}
            </button>
          </div>
          {message && <p className="mt-2 text-sm">{message}</p>}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
