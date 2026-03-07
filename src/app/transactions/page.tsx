/**
 * AUTO-FILE-COMMENT: src/app/transactions/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import HeaderBack from "@/components/ui/HeaderBack";
import StatCard from "@/components/ui/StatCard";
import ChartCard from "@/components/ui/ChartCard";
import FilterPill from "@/components/ui/FilterPill";
import ActionRow from "@/components/ui/ActionRow";
import HistoryRow from "@/components/ui/HistoryRow";
import BottomNav from "@/components/ui/BottomNav";
import { formatNaira } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBookings } from "@/features/bookings/bookingsSlice";

type Booking = {
  _id: string;
  service: string;
  dateTime: string;
  amountPaid?: number;
  estimatedPrice?: number;
  barberId?: { name?: string } | string;
  paymentStatus?: string;
};

/**
 * AUTO-FUNCTION-COMMENT: TransactionsPage
 * Purpose: Handles transactions page.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const dispatch = useAppDispatch();`.
 * 3. Executes `const bookings = useAppSelector((state) => state.bookings.items);`.
 * 4. Executes `const loading = useAppSelector((state) => state.bookings.loading);`.
 * 5. Executes `const [serviceFilter, setServiceFilter] = useState<string>("");`.
 * 6. Executes `const [from, setFrom] = useState<string>("");`.
 * 7. Executes `const [to, setTo] = useState<string>("");`.
 * 8. Executes `async function fetchData() {`.
 * 9. Executes `dispatch(fetchBookings({ service: serviceFilter, from, to }));`.
 * 10. Executes `}`.
 * 11. Executes `useEffect(() => {`.
 * 12. Executes `if (session?.user) fetchData();`.
 * 13. Executes `}, [session]);`.
 * 14. Executes `const totalSpending = useMemo(() => {`.
 * 15. Executes `if (!bookings) return 0;`.
 * 16. Executes `return bookings.reduce((s, b) => s + (b.amountPaid ?? b.estimatedPrice ?? 0), 0);`.
 * 17. Executes `}, [bookings]);`.
 * 18. Executes `return (`.
 * 19. Executes `<div className="min-h-screen flex flex-col justify-between bg-white">`.
 * 20. Executes `<div>`.
 * 21. Executes `<HeaderBack title="Transactions" />`.
 * 22. Executes `<div className="px-4 py-6">`.
 * 23. Executes `<StatCard`.
 * 24. Executes `title="Spending"`.
 * 25. Executes `amount={formatNaira(totalSpending)}`.
 * 26. Executes `duration="Last 30 Days"`.
 * 27. Executes `percentageChange="+15%"`.
 * 28. Executes `/>`.
 * 29. Executes `<ChartCard />`.
 * 30. Executes `</div>`.
 * 31. Executes `<h3 className="px-4 pb-2 pt-4 text-lg font-bold">Filter</h3>`.
 * 32. Executes `<div className="flex gap-3 px-4 py-3 flex-wrap items-center">`.
 * 33. Executes `<FilterPill label="Date" />`.
 * 34. Executes `<FilterPill label="Service" />`.
 * 35. Executes `<input`.
 * 36. Executes `type="text"`.
 * 37. Executes `placeholder="Service name"`.
 * 38. Executes `value={serviceFilter}`.
 * 39. Executes `onChange={(e) => setServiceFilter(e.target.value)}`.
 * 40. Executes `className="border rounded px-2 py-1 ml-2"`.
 * 41. Executes `/>`.
 * 42. Executes `<div className="ml-auto flex gap-2 items-center">`.
 * 43. Executes `<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1" />`.
 * 44. Executes `<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1" />`.
 * 45. Executes `<button onClick={fetchData} className="px-3 py-1 bg-[#f2800d] text-white rounded">Apply</button>`.
 * 46. Executes `</div>`.
 * 47. Executes `</div>`.
 * 48. Executes `<ActionRow label="Download Receipts" onClick={() => alert("Download per booking below")} />`.
 * 49. Executes `<h3 className="px-4 pb-2 pt-4 text-lg font-bold">History</h3>`.
 * 50. Executes `{loading && (`.
 * 51. Executes `<div className="px-4">`.
 * 52. Executes `{[1, 2, 3].map((i) => (`.
 * 53. Executes `<div key={i} className="animate-pulse py-3">`.
 * 54. Executes `<div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />`.
 * 55. Executes `<div className="h-4 bg-gray-200 rounded w-1/4" />`.
 * 56. Executes `</div>`.
 * 57. Executes `))}`.
 * 58. Executes `</div>`.
 * 59. Executes `)}`.
 * 60. Executes `{!loading && bookings?.length === 0 && <p className="px-4 py-4">No transactions yet</p>}`.
 * 61. Executes `{/* {!loading && bookings?.map((b) => (`.
 * 62. Executes `<div key={b._id} className="px-4">`.
 * 63. Executes `<HistoryRow`.
 * 64. Executes `date={new Date(b.dateTime).toLocaleDateString()}`.
 * 65. Executes `barber={typeof b.barberId === "string" ? b.barberId : b.barberId?.name ?? "Unknown"}`.
 * 66. Executes `amount={formatNaira(b.amountPaid ?? b.estimatedPrice ?? 0)}`.
 * 67. Executes `/>`.
 * 68. Executes `<div className="flex justify-end px-4 py-2">`.
 * 69. Executes `<a href={\`/api/receipt/${b._id}\`} className="text-sm text-[#f2800d]">Download receipt</a>`.
 * 70. Executes `</div>`.
 * 71. Executes `</div>`.
 * 72. Executes `))} * /}`.
 * 73. Executes `{!loading && bookings?.map((b) => (`.
 * 74. Executes `<div key={b._id} className="px-4">`.
 * 75. Executes `<HistoryRow`.
 * 76. Executes `date={new Date(b.dateTime).toLocaleDateString()}`.
 * 77. Executes `barber={typeof b.barberId === "string" ? b.barberId : b.barberId?.name ?? "Unknown"}`.
 * 78. Executes `amount={formatNaira(b.amountPaid ?? b.estimatedPrice ?? 0)}`.
 * 79. Executes `/>`.
 * 80. Executes `{/* Download button * /}`.
 * 81. Executes `<div className="flex justify-end px-4 py-2">`.
 * 82. Executes `<button`.
 * 83. Executes `onClick={() => window.open(\`/api/receipt/${b._id}\`, "_blank")}`.
 * 84. Executes `className="text-sm text-white bg-[#f2800d] px-3 py-1 rounded-md"`.
 * 85. Executes `>`.
 * 86. Executes `Download Receipt`.
 * 87. Executes `</button>`.
 * 88. Executes `</div>`.
 * 89. Executes `</div>`.
 * 90. Executes `))}`.
 * 91. Executes `</div>`.
 * 92. Executes `<div>`.
 * 93. Executes `<BottomNav />`.
 * 94. Executes `</div>`.
 * 95. Executes `</div>`.
 * 96. Executes `);`.
 */
export default function TransactionsPage() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.bookings.items);
  const loading = useAppSelector((state) => state.bookings.loading);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // fetch bookings for logged in user (server filters by session)
  /**
   * AUTO-FUNCTION-COMMENT: fetchData
   * Purpose: Handles fetch data.
   * Line-by-line:
   * 1. Executes `dispatch(fetchBookings({ service: serviceFilter, from, to }));`.
   */
  async function fetchData() {
    dispatch(fetchBookings({ service: serviceFilter, from, to }));
  }

  useEffect(() => {
    if (session?.user) fetchData();
  }, [session]);

  const totalSpending = useMemo(() => {
    if (!bookings) return 0;
    return bookings.reduce((s, b) => s + (b.amountPaid ?? b.estimatedPrice ?? 0), 0);
  }, [bookings]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <HeaderBack title="Transactions" />

        <div className="px-4 py-6">
          <StatCard
            title="Spending"
            amount={formatNaira(totalSpending)}
            duration="Last 30 Days"
            percentageChange="+15%"
          />

          <ChartCard />
        </div>

        <h3 className="px-4 pb-2 pt-4 text-lg font-bold">Filter</h3>
        <div className="flex gap-3 px-4 py-3 flex-wrap items-center">
          <FilterPill label="Date" />
          <FilterPill label="Service" />
          <input
            type="text"
            placeholder="Service name"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="border rounded px-2 py-1 ml-2"
          />
          <div className="ml-auto flex gap-2 items-center">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1" />
            <button onClick={fetchData} className="px-3 py-1 bg-[#f2800d] text-white rounded">Apply</button>
          </div>
        </div>

        <ActionRow label="Download Receipts" onClick={() => alert("Download per booking below")} />

        <h3 className="px-4 pb-2 pt-4 text-lg font-bold">History</h3>

        {loading && (
          <div className="px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse py-3">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && bookings?.length === 0 && <p className="px-4 py-4">No transactions yet</p>}

        {/* {!loading && bookings?.map((b) => (
          <div key={b._id} className="px-4">
            <HistoryRow
              date={new Date(b.dateTime).toLocaleDateString()}
              barber={typeof b.barberId === "string" ? b.barberId : b.barberId?.name ?? "Unknown"}
              amount={formatNaira(b.amountPaid ?? b.estimatedPrice ?? 0)}
            />
            <div className="flex justify-end px-4 py-2">
              <a href={`/api/receipt/${b._id}`} className="text-sm text-[#f2800d]">Download receipt</a>
            </div>
          </div>
        ))} */}

        {!loading && bookings?.map((b) => (
  <div key={b._id} className="px-4">
    <HistoryRow
      date={new Date(b.dateTime).toLocaleDateString()}
      barber={typeof b.barberId === "string" ? b.barberId : b.barberId?.name ?? "Unknown"}
      amount={formatNaira(b.amountPaid ?? b.estimatedPrice ?? 0)}
    />

    {/* Download button */}
    <div className="flex justify-end px-4 py-2">
      <button
        onClick={() => window.open(`/api/receipt/${b._id}`, "_blank")}
        className="text-sm text-white bg-[#f2800d] px-3 py-1 rounded-md"
      >
        Download Receipt
      </button>
    </div>
  </div>
))}


      </div>

      <div>
        <BottomNav />
      </div>
    </div>
  );
}
