/**
 * AUTO-FILE-COMMENT: src/app/checkout/[bookingId]/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: CheckoutPage
 * Purpose: Handles checkout page.
 * Line-by-line:
 * 1. Executes `const { data: session, status } = useSession();`.
 * 2. Executes `const router = useRouter();`.
 * 3. Executes `const params = useParams<{ bookingId: string }>();`.
 * 4. Executes `const bookingId = params?.bookingId;`.
 * 5. Executes `const [booking, setBooking] = useState<CheckoutBooking | null>(null);`.
 * 6. Executes `const [loading, setLoading] = useState(true);`.
 * 7. Executes `const [paying, setPaying] = useState(false);`.
 * 8. Executes `const [message, setMessage] = useState<string | null>(null);`.
 * 9. Executes `const [error, setError] = useState<string | null>(null);`.
 * 10. Executes `useEffect(() => {`.
 * 11. Executes `if (!bookingId || status === "loading") return;`.
 * 12. Executes `let mounted = true;`.
 * 13. Executes `const load = async () => {`.
 * 14. Executes `setLoading(true);`.
 * 15. Executes `setError(null);`.
 * 16. Executes `try {`.
 * 17. Executes `const res = await fetch(\`/api/bookings/${bookingId}\`, {`.
 * 18. Executes `cache: "no-store",`.
 * 19. Executes `});`.
 * 20. Executes `const json = await res.json();`.
 * 21. Executes `if (!res.ok) {`.
 * 22. Executes `throw new Error(json.error || "Failed to load booking");`.
 * 23. Executes `}`.
 * 24. Executes `if (mounted) setBooking(json.booking);`.
 * 25. Executes `} catch (err) {`.
 * 26. Executes `if (mounted) {`.
 * 27. Executes `setError(err instanceof Error ? err.message : "Failed to load booking");`.
 * 28. Executes `}`.
 * 29. Executes `} finally {`.
 * 30. Executes `if (mounted) setLoading(false);`.
 * 31. Executes `}`.
 * 32. Executes `};`.
 * 33. Executes `void load();`.
 * 34. Executes `return () => {`.
 * 35. Executes `mounted = false;`.
 * 36. Executes `};`.
 * 37. Executes `}, [bookingId, status]);`.
 * 38. Executes `async function handlePayNow() {`.
 * 39. Executes `if (!bookingId) return;`.
 * 40. Executes `setPaying(true);`.
 * 41. Executes `setError(null);`.
 * 42. Executes `setMessage("Initializing secure checkout...");`.
 * 43. Executes `try {`.
 * 44. Executes `const res = await fetch("/api/paystack", {`.
 * 45. Executes `method: "POST",`.
 * 46. Executes `headers: { "Content-Type": "application/json" },`.
 * 47. Executes `body: JSON.stringify({ bookingId }),`.
 * 48. Executes `});`.
 * 49. Executes `const json = await res.json();`.
 * 50. Executes `if (!res.ok) {`.
 * 51. Executes `throw new Error(json.error || "Failed to start payment");`.
 * 52. Executes `}`.
 * 53. Executes `if (!json.authUrl) {`.
 * 54. Executes `throw new Error("Missing payment authorization URL");`.
 * 55. Executes `}`.
 * 56. Executes `window.location.href = json.authUrl;`.
 * 57. Executes `} catch (err) {`.
 * 58. Executes `setError(err instanceof Error ? err.message : "Payment initialization failed");`.
 * 59. Executes `setMessage(null);`.
 * 60. Executes `setPaying(false);`.
 * 61. Executes `}`.
 * 62. Executes `}`.
 * 63. Executes `if (status === "loading" || loading) {`.
 * 64. Executes `return <div className="min-h-screen bg-white p-6">Loading checkout...</div>;`.
 * 65. Executes `}`.
 * 66. Executes `if (!session?.user) {`.
 * 67. Executes `return (`.
 * 68. Executes `<div className="min-h-screen bg-white p-6">`.
 * 69. Executes `<p className="font-semibold">Please sign in to continue to checkout.</p>`.
 * 70. Executes `</div>`.
 * 71. Executes `);`.
 * 72. Executes `}`.
 * 73. Executes `if (error && !booking) {`.
 * 74. Executes `return (`.
 * 75. Executes `<div className="min-h-screen bg-white">`.
 * 76. Executes `<HeaderBack title="Checkout" />`.
 * 77. Executes `<div className="px-4 py-6">`.
 * 78. Executes `<p className="text-red-600 text-sm">{error}</p>`.
 * 79. Executes `</div>`.
 * 80. Executes `</div>`.
 * 81. Executes `);`.
 * 82. Executes `}`.
 * 83. Executes `if (!booking) {`.
 * 84. Executes `return (`.
 * 85. Executes `<div className="min-h-screen bg-white">`.
 * 86. Executes `<HeaderBack title="Checkout" />`.
 * 87. Executes `<div className="px-4 py-6">`.
 * 88. Executes `<p className="text-sm text-gray-500">Booking not found.</p>`.
 * 89. Executes `</div>`.
 * 90. Executes `</div>`.
 * 91. Executes `);`.
 * 92. Executes `}`.
 * 93. Executes `const barberName =`.
 * 94. Executes `booking.barberId?.userId?.name || booking.barberId?.userId?.email || "Barber";`.
 * 95. Executes `const payableAmount = booking.amountPaid || booking.estimatedPrice || 0;`.
 * 96. Executes `const isPaid = booking.paymentStatus === "paid";`.
 * 97. Executes `return (`.
 * 98. Executes `<div className="min-h-screen flex flex-col justify-between bg-white">`.
 * 99. Executes `<div>`.
 * 100. Executes `<HeaderBack title="Checkout" />`.
 * 101. Executes `<div className="px-4 pt-3 pb-2">`.
 * 102. Executes `<h2 className="text-[22px] font-bold text-[#181411]">Review & Pay</h2>`.
 * 103. Executes `<p className="text-sm text-[#8a7560] mt-1">`.
 * 104. Executes `You can pay now with Paystack or pay later from your booking details.`.
 * 105. Executes `</p>`.
 * 106. Executes `</div>`.
 * 107. Executes `<div className="px-4 py-3">`.
 * 108. Executes `<div className="rounded-2xl border border-[#f0e8e0] bg-[#fcfaf8] p-4">`.
 * 109. Executes `<p className="text-sm text-[#8a7560]">Booking ID</p>`.
 * 110. Executes `<p className="font-medium break-all">{booking._id}</p>`.
 * 111. Executes `<p className="text-sm text-[#8a7560] mt-3">Barber</p>`.
 * 112. Executes `<p className="font-medium">{barberName}</p>`.
 * 113. Executes `</div>`.
 * 114. Executes `</div>`.
 * 115. Executes `<DetailRow icon={<Scissors size={24} />} label="Service" value={booking.service} />`.
 * 116. Executes `<DetailRow`.
 * 117. Executes `icon={<Calendar size={24} />}`.
 * 118. Executes `label="Date"`.
 * 119. Executes `value={new Date(booking.dateTime).toLocaleDateString()}`.
 * 120. Executes `/>`.
 * 121. Executes `<DetailRow`.
 * 122. Executes `icon={<Clock size={24} />}`.
 * 123. Executes `label="Time"`.
 * 124. Executes `value={new Date(booking.dateTime).toLocaleTimeString()}`.
 * 125. Executes `/>`.
 * 126. Executes `<DetailRow icon={<MapPin size={24} />} label="Address" value={booking.address || "Not provided"} />`.
 * 127. Executes `<DetailRow icon={<Wallet size={24} />} label="Amount" value={formatNaira(payableAmount)} />`.
 * 128. Executes `<div className="px-4 pt-3">`.
 * 129. Executes `<div className="rounded-xl border border-[#f0e8e0] bg-white p-4">`.
 * 130. Executes `<div className="flex items-center justify-between gap-2">`.
 * 131. Executes `<span className="text-sm text-[#8a7560]">Booking Status</span>`.
 * 132. Executes `<span className="text-sm font-medium">{booking.status || "pending"}</span>`.
 * 133. Executes `</div>`.
 * 134. Executes `<div className="flex items-center justify-between gap-2 mt-2">`.
 * 135. Executes `<span className="text-sm text-[#8a7560]">Payment Status</span>`.
 * 136. Executes `<span`.
 * 137. Executes `className={\`text-sm font-medium ${`.
 * 138. Executes `isPaid ? "text-green-700" : "text-[#f2800d]"`.
 * 139. Executes `}\`}`.
 * 140. Executes `>`.
 * 141. Executes `{booking.paymentStatus || "pending"}`.
 * 142. Executes `</span>`.
 * 143. Executes `</div>`.
 * 144. Executes `</div>`.
 * 145. Executes `</div>`.
 * 146. Executes `{error && (`.
 * 147. Executes `<p className="px-4 pt-4 text-sm text-red-600">{error}</p>`.
 * 148. Executes `)}`.
 * 149. Executes `{message && (`.
 * 150. Executes `<p className="px-4 pt-4 text-sm text-[#8a7560]">{message}</p>`.
 * 151. Executes `)}`.
 * 152. Executes `</div>`.
 * 153. Executes `<div>`.
 * 154. Executes `<div className="px-4 py-4">`.
 * 155. Executes `<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">`.
 * 156. Executes `<button`.
 * 157. Executes `className="h-12 rounded-lg bg-[#f5f2f0] font-bold text-[#181411]"`.
 * 158. Executes `onClick={() => router.push(\`/bookings/${booking._id}\`)}`.
 * 159. Executes `disabled={paying}`.
 * 160. Executes `>`.
 * 161. Executes `Pay Later`.
 * 162. Executes `</button>`.
 * 163. Executes `<button`.
 * 164. Executes `className="h-12 rounded-lg border border-[#f2800d] font-bold text-[#f2800d]"`.
 * 165. Executes `onClick={() => router.push("/transactions")}`.
 * 166. Executes `disabled={paying}`.
 * 167. Executes `>`.
 * 168. Executes `Transactions`.
 * 169. Executes `</button>`.
 * 170. Executes `<button`.
 * 171. Executes `className="h-12 rounded-lg bg-[#f2800d] font-bold text-white disabled:bg-[#f0b67b]"`.
 * 172. Executes `onClick={handlePayNow}`.
 * 173. Executes `disabled={paying || isPaid}`.
 * 174. Executes `>`.
 * 175. Executes `{isPaid ? "Already Paid" : paying ? "Opening Paystack..." : "Pay Now"}`.
 * 176. Executes `</button>`.
 * 177. Executes `</div>`.
 * 178. Executes `</div>`.
 * 179. Executes `<BottomNav />`.
 * 180. Executes `</div>`.
 * 181. Executes `</div>`.
 * 182. Executes `);`.
 */
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

    /**
     * AUTO-FUNCTION-COMMENT: load
     * Purpose: Handles load.
     * Line-by-line:
     * 1. Executes `setLoading(true);`.
     * 2. Executes `setError(null);`.
     * 3. Executes `try {`.
     * 4. Executes `const res = await fetch(\`/api/bookings/${bookingId}\`, {`.
     * 5. Executes `cache: "no-store",`.
     * 6. Executes `});`.
     * 7. Executes `const json = await res.json();`.
     * 8. Executes `if (!res.ok) {`.
     * 9. Executes `throw new Error(json.error || "Failed to load booking");`.
     * 10. Executes `}`.
     * 11. Executes `if (mounted) setBooking(json.booking);`.
     * 12. Executes `} catch (err) {`.
     * 13. Executes `if (mounted) {`.
     * 14. Executes `setError(err instanceof Error ? err.message : "Failed to load booking");`.
     * 15. Executes `}`.
     * 16. Executes `} finally {`.
     * 17. Executes `if (mounted) setLoading(false);`.
     * 18. Executes `}`.
     */
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

  /**
   * AUTO-FUNCTION-COMMENT: handlePayNow
   * Purpose: Handles handle pay now.
   * Line-by-line:
   * 1. Executes `if (!bookingId) return;`.
   * 2. Executes `setPaying(true);`.
   * 3. Executes `setError(null);`.
   * 4. Executes `setMessage("Initializing secure checkout...");`.
   * 5. Executes `try {`.
   * 6. Executes `const res = await fetch("/api/paystack", {`.
   * 7. Executes `method: "POST",`.
   * 8. Executes `headers: { "Content-Type": "application/json" },`.
   * 9. Executes `body: JSON.stringify({ bookingId }),`.
   * 10. Executes `});`.
   * 11. Executes `const json = await res.json();`.
   * 12. Executes `if (!res.ok) {`.
   * 13. Executes `throw new Error(json.error || "Failed to start payment");`.
   * 14. Executes `}`.
   * 15. Executes `if (!json.authUrl) {`.
   * 16. Executes `throw new Error("Missing payment authorization URL");`.
   * 17. Executes `}`.
   * 18. Executes `window.location.href = json.authUrl;`.
   * 19. Executes `} catch (err) {`.
   * 20. Executes `setError(err instanceof Error ? err.message : "Payment initialization failed");`.
   * 21. Executes `setMessage(null);`.
   * 22. Executes `setPaying(false);`.
   * 23. Executes `}`.
   */
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
        <p className="font-semibold">Please sign in to continue to checkout.</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderBack title="Checkout" />
        <div className="px-4 py-6">
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
          <p className="text-sm text-gray-500">Booking not found.</p>
        </div>
      </div>
    );
  }

  const barberName =
    booking.barberId?.userId?.name || booking.barberId?.userId?.email || "Barber";
  const payableAmount = booking.amountPaid || booking.estimatedPrice || 0;
  const isPaid = booking.paymentStatus === "paid";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <HeaderBack title="Checkout" />

        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[22px] font-bold text-[#181411]">Review & Pay</h2>
          <p className="text-sm text-[#8a7560] mt-1">
            You can pay now with Paystack or pay later from your booking details.
          </p>
        </div>

        <div className="px-4 py-3">
          <div className="rounded-2xl border border-[#f0e8e0] bg-[#fcfaf8] p-4">
            <p className="text-sm text-[#8a7560]">Booking ID</p>
            <p className="font-medium break-all">{booking._id}</p>
            <p className="text-sm text-[#8a7560] mt-3">Barber</p>
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

        <div className="px-4 pt-3">
          <div className="rounded-xl border border-[#f0e8e0] bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-[#8a7560]">Booking Status</span>
              <span className="text-sm font-medium">{booking.status || "pending"}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-sm text-[#8a7560]">Payment Status</span>
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
          <p className="px-4 pt-4 text-sm text-red-600">{error}</p>
        )}
        {message && (
          <p className="px-4 pt-4 text-sm text-[#8a7560]">{message}</p>
        )}
      </div>

      <div>
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              className="h-12 rounded-lg bg-[#f5f2f0] font-bold text-[#181411]"
              onClick={() => router.push(`/bookings/${booking._id}`)}
              disabled={paying}
            >
              Pay Later
            </button>
            <button
              className="h-12 rounded-lg border border-[#f2800d] font-bold text-[#f2800d]"
              onClick={() => router.push("/transactions")}
              disabled={paying}
            >
              Transactions
            </button>
            <button
              className="h-12 rounded-lg bg-[#f2800d] font-bold text-white disabled:bg-[#f0b67b]"
              onClick={handlePayNow}
              disabled={paying || isPaid}
            >
              {isPaid ? "Already Paid" : paying ? "Opening Paystack..." : "Pay Now"}
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

