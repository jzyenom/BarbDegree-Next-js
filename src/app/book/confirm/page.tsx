"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import HeaderBack from "@/components/ui/HeaderBack";
import DetailRow from "@/components/ui/DetailRow";
import BottomNav from "@/components/ui/BottomNav";
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

/**
 * AUTO-FUNCTION-COMMENT: ConfirmBookingPage
 * Purpose: Handles confirm booking page.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const router = useRouter();`.
 * 3. Executes `const [loading, setLoading] = useState(false);`.
 * 4. Executes `const [message, setMessage] = useState<string | null>(null);`.
 * 5. Executes `const payload: BookingPayload = {`.
 * 6. Executes `barberId: searchParams?.barberId || "",`.
 * 7. Executes `name: session?.user?.name || "",`.
 * 8. Executes `email: session?.user?.email || "",`.
 * 9. Executes `address: searchParams?.address || "",`.
 * 10. Executes `service: searchParams?.service || "Service",`.
 * 11. Executes `dateTime: searchParams?.dateTime || new Date().toISOString(),`.
 * 12. Executes `estimatedPrice: searchParams?.price ? Number(searchParams.price) : 0,`.
 * 13. Executes `};`.
 * 14. Executes `async function handleConfirmAndPay() {`.
 * 15. Executes `if (!session?.user?.id) {`.
 * 16. Executes `setMessage("You must be signed in to confirm booking.");`.
 * 17. Executes `return;`.
 * 18. Executes `}`.
 * 19. Executes `setLoading(true);`.
 * 20. Executes `setMessage(null);`.
 * 21. Executes `try {`.
 * 22. Executes `// 1) Create booking (server uses session to set clientId)`.
 * 23. Executes `const createRes = await fetch("/api/bookings", {`.
 * 24. Executes `method: "POST",`.
 * 25. Executes `headers: { "Content-Type": "application/json" },`.
 * 26. Executes `body: JSON.stringify({`.
 * 27. Executes `barberId: payload.barberId,`.
 * 28. Executes `name: payload.name,`.
 * 29. Executes `email: payload.email,`.
 * 30. Executes `address: payload.address,`.
 * 31. Executes `service: payload.service,`.
 * 32. Executes `dateTime: payload.dateTime,`.
 * 33. Executes `estimatedPrice: payload.estimatedPrice,`.
 * 34. Executes `}),`.
 * 35. Executes `});`.
 * 36. Executes `const createJson = await createRes.json();`.
 * 37. Executes `if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Create failed");`.
 * 38. Executes `const booking = createJson.booking;`.
 * 39. Executes `setMessage("Booking created. Opening checkout...");`.
 * 40. Executes `router.push(\`/checkout/${booking._id}\`);`.
 * 41. Executes `} catch (err: unknown) {`.
 * 42. Executes `console.error(err);`.
 * 43. Executes `setMessage(err instanceof Error ? err.message : "Booking failed");`.
 * 44. Executes `} finally {`.
 * 45. Executes `setLoading(false);`.
 * 46. Executes `}`.
 * 47. Executes `}`.
 * 48. Executes `async function handleConfirmWithoutPay() {`.
 * 49. Executes `if (!session?.user?.id) {`.
 * 50. Executes `setMessage("You must be signed in to confirm booking.");`.
 * 51. Executes `return;`.
 * 52. Executes `}`.
 * 53. Executes `setLoading(true);`.
 * 54. Executes `setMessage(null);`.
 * 55. Executes `try {`.
 * 56. Executes `const createRes = await fetch("/api/bookings", {`.
 * 57. Executes `method: "POST",`.
 * 58. Executes `headers: { "Content-Type": "application/json" },`.
 * 59. Executes `body: JSON.stringify({`.
 * 60. Executes `barberId: payload.barberId,`.
 * 61. Executes `name: payload.name,`.
 * 62. Executes `email: payload.email,`.
 * 63. Executes `address: payload.address,`.
 * 64. Executes `service: payload.service,`.
 * 65. Executes `dateTime: payload.dateTime,`.
 * 66. Executes `estimatedPrice: payload.estimatedPrice,`.
 * 67. Executes `}),`.
 * 68. Executes `});`.
 * 69. Executes `const createJson = await createRes.json();`.
 * 70. Executes `if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Create failed");`.
 * 71. Executes `setMessage("Booking created. Redirecting to booking details...");`.
 * 72. Executes `setTimeout(() => router.push(\`/bookings/${createJson.booking?._id}\`), 600);`.
 * 73. Executes `} catch (err: unknown) {`.
 * 74. Executes `console.error(err);`.
 * 75. Executes `setMessage(err instanceof Error ? err.message : "Booking failed");`.
 * 76. Executes `} finally {`.
 * 77. Executes `setLoading(false);`.
 * 78. Executes `}`.
 * 79. Executes `}`.
 * 80. Executes `return (`.
 * 81. Executes `<div className="min-h-screen flex flex-col justify-between bg-white">`.
 * 82. Executes `<div>`.
 * 83. Executes `<HeaderBack title="Booking Confirmation" />`.
 * 84. Executes `<h2 className="text-[#181411] text-[22px] font-bold px-4 pt-5 pb-3">Service Details</h2>`.
 * 85. Executes `<DetailRow icon={<Scissors size={24} />} label="Service" value={payload.service} />`.
 * 86. Executes `<DetailRow icon={<Calendar size={24} />} label="Date" value={new Date(payload.dateTime).toLocaleDateString()} />`.
 * 87. Executes `<DetailRow icon={<Clock size={24} />} label="Time" value={new Date(payload.dateTime).toLocaleTimeString()} />`.
 * 88. Executes `<DetailRow icon={<MapPin size={24} />} label="Address" value={payload.address || "Not provided"} />`.
 * 89. Executes `<DetailRow icon={<DollarSign size={24} />} label="Estimated Price" value={formatNaira(payload.estimatedPrice)} />`.
 * 90. Executes `</div>`.
 * 91. Executes `<div>`.
 * 92. Executes `<div className="px-4 py-3">`.
 * 93. Executes `<div className="flex gap-3">`.
 * 94. Executes `<button`.
 * 95. Executes `className="flex-1 h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold"`.
 * 96. Executes `onClick={() => router.back()}`.
 * 97. Executes `disabled={loading}`.
 * 98. Executes `>`.
 * 99. Executes `Edit`.
 * 100. Executes `</button>`.
 * 101. Executes `<div className="flex-1 grid grid-cols-2 gap-3">`.
 * 102. Executes `<button`.
 * 103. Executes `className="h-12 rounded-lg bg-white border border-[#f2800d] text-[#f2800d] font-bold"`.
 * 104. Executes `onClick={handleConfirmWithoutPay}`.
 * 105. Executes `disabled={loading}`.
 * 106. Executes `>`.
 * 107. Executes `Confirm (No Pay)`.
 * 108. Executes `</button>`.
 * 109. Executes `<button`.
 * 110. Executes `className="h-12 rounded-lg bg-[#f2800d] text-white font-bold"`.
 * 111. Executes `onClick={handleConfirmAndPay}`.
 * 112. Executes `disabled={loading}`.
 * 113. Executes `>`.
 * 114. Executes `{loading ? "Processing..." : "Confirm & Checkout"}`.
 * 115. Executes `</button>`.
 * 116. Executes `</div>`.
 * 117. Executes `</div>`.
 * 118. Executes `{message && <p className="mt-3 text-sm text-center text-[#8a7560]">{message}</p>}`.
 * 119. Executes `</div>`.
 * 120. Executes `<BottomNav />`.
 * 121. Executes `</div>`.
 * 122. Executes `</div>`.
 * 123. Executes `);`.
 */
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

  /**
   * AUTO-FUNCTION-COMMENT: handleConfirmAndPay
   * Purpose: Handles handle confirm and pay.
   * Line-by-line:
   * 1. Executes `if (!session?.user?.id) {`.
   * 2. Executes `setMessage("You must be signed in to confirm booking.");`.
   * 3. Executes `return;`.
   * 4. Executes `}`.
   * 5. Executes `setLoading(true);`.
   * 6. Executes `setMessage(null);`.
   * 7. Executes `try {`.
   * 8. Executes `// 1) Create booking (server uses session to set clientId)`.
   * 9. Executes `const createRes = await fetch("/api/bookings", {`.
   * 10. Executes `method: "POST",`.
   * 11. Executes `headers: { "Content-Type": "application/json" },`.
   * 12. Executes `body: JSON.stringify({`.
   * 13. Executes `barberId: payload.barberId,`.
   * 14. Executes `name: payload.name,`.
   * 15. Executes `email: payload.email,`.
   * 16. Executes `address: payload.address,`.
   * 17. Executes `service: payload.service,`.
   * 18. Executes `dateTime: payload.dateTime,`.
   * 19. Executes `estimatedPrice: payload.estimatedPrice,`.
   * 20. Executes `}),`.
   * 21. Executes `});`.
   * 22. Executes `const createJson = await createRes.json();`.
   * 23. Executes `if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Create failed");`.
   * 24. Executes `const booking = createJson.booking;`.
   * 25. Executes `setMessage("Booking created. Opening checkout...");`.
   * 26. Executes `router.push(\`/checkout/${booking._id}\`);`.
   * 27. Executes `} catch (err: unknown) {`.
   * 28. Executes `console.error(err);`.
   * 29. Executes `setMessage(err instanceof Error ? err.message : "Booking failed");`.
   * 30. Executes `} finally {`.
   * 31. Executes `setLoading(false);`.
   * 32. Executes `}`.
   */
  async function handleConfirmAndPay() {
    if (!session?.user?.id) {
      setMessage("You must be signed in to confirm booking.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // 1) Create booking (server uses session to set clientId)
      const createRes = await fetch("/api/bookings", {
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
      setMessage("Booking created. Opening checkout...");
      router.push(`/checkout/${booking._id}`);
    } catch (err: unknown) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  /**
   * AUTO-FUNCTION-COMMENT: handleConfirmWithoutPay
   * Purpose: Handles handle confirm without pay.
   * Line-by-line:
   * 1. Executes `if (!session?.user?.id) {`.
   * 2. Executes `setMessage("You must be signed in to confirm booking.");`.
   * 3. Executes `return;`.
   * 4. Executes `}`.
   * 5. Executes `setLoading(true);`.
   * 6. Executes `setMessage(null);`.
   * 7. Executes `try {`.
   * 8. Executes `const createRes = await fetch("/api/bookings", {`.
   * 9. Executes `method: "POST",`.
   * 10. Executes `headers: { "Content-Type": "application/json" },`.
   * 11. Executes `body: JSON.stringify({`.
   * 12. Executes `barberId: payload.barberId,`.
   * 13. Executes `name: payload.name,`.
   * 14. Executes `email: payload.email,`.
   * 15. Executes `address: payload.address,`.
   * 16. Executes `service: payload.service,`.
   * 17. Executes `dateTime: payload.dateTime,`.
   * 18. Executes `estimatedPrice: payload.estimatedPrice,`.
   * 19. Executes `}),`.
   * 20. Executes `});`.
   * 21. Executes `const createJson = await createRes.json();`.
   * 22. Executes `if (!createRes.ok) throw new Error(createJson?.error || createJson?.message || "Create failed");`.
   * 23. Executes `setMessage("Booking created. Redirecting to booking details...");`.
   * 24. Executes `setTimeout(() => router.push(\`/bookings/${createJson.booking?._id}\`), 600);`.
   * 25. Executes `} catch (err: unknown) {`.
   * 26. Executes `console.error(err);`.
   * 27. Executes `setMessage(err instanceof Error ? err.message : "Booking failed");`.
   * 28. Executes `} finally {`.
   * 29. Executes `setLoading(false);`.
   * 30. Executes `}`.
   */
  async function handleConfirmWithoutPay() {
    if (!session?.user?.id) {
      setMessage("You must be signed in to confirm booking.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const createRes = await fetch("/api/bookings", {
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

      setMessage("Booking created. Redirecting to booking details...");
      setTimeout(() => router.push(`/bookings/${createJson.booking?._id}`), 600);
    } catch (err: unknown) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Booking failed");
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
                {loading ? "Processing..." : "Confirm & Checkout"}
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
