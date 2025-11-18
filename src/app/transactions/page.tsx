// "use client";

// import HeaderBack from "@/components/ui/HeaderBack";
// import StatCard from "@/components/ui/StatCard";
// import ChartCard from "@/components/ui/ChartCard";
// import FilterPill from "@/components/ui/FilterPill";
// import ActionRow from "@/components/ui/ActionRow";
// import HistoryRow from "@/components/ui/HistoryRow";
// import BottomNav from "@/components/ui/BottomNav";

// export default function TransactionsPage() {
//   return (
//     <div className="min-h-screen flex flex-col justify-between bg-white">
//       <div>
//         <HeaderBack title="Transactions" />

//         <div className="px-4 py-6">
//           <StatCard
//             title="Spending"
//             amount="₦1,250"
//             duration="Last 30 Days"
//             percentageChange="+15%"
//           />

//           <ChartCard />
//         </div>

//         <h3 className="px-4 pb-2 pt-4 text-lg font-bold">Filter</h3>

//         <div className="flex gap-3 px-4 py-3 flex-wrap">
//           <FilterPill label="Date" />
//           <FilterPill label="Service" />
//         </div>

//         <ActionRow label="Download Receipts" />

//         <h3 className="px-4 pb-2 pt-4 text-lg font-bold">History</h3>

//         <HistoryRow date="05/15/2024" barber="Alex" amount="₦50" />
//         <HistoryRow date="04/20/2024" barber="Chris" amount="₦45" />
//         <HistoryRow date="03/25/2024" barber="David" amount="₦60" />
//       </div>

//       <div>
//         <BottomNav />
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import HeaderBack from "@/components/ui/HeaderBack";
import StatCard from "@/components/ui/StatCard";
import ChartCard from "@/components/ui/ChartCard";
import FilterPill from "@/components/ui/FilterPill";
import ActionRow from "@/components/ui/ActionRow";
import HistoryRow from "@/components/ui/HistoryRow";
import BottomNav from "@/components/ui/BottomNav";

type Booking = {
  _id: string;
  service: string;
  dateTime: string;
  amountPaid?: number;
  estimatedPrice?: number;
  barberId?: { name?: string } | string;
};

export default function TransactionsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const clientId = "64a...clientId"; // replace with real user id from session

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("clientId", clientId);
      if (serviceFilter) params.set("service", serviceFilter);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalSpending = (bookings || []).reduce((sum, b) => sum + (b.amountPaid ?? b.estimatedPrice ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <HeaderBack title="Transactions" />

        <div className="px-4 py-6">
          <StatCard title="Spending" amount={`₦${totalSpending}`} duration="Last 30 Days" percentageChange="+15%" />
          <ChartCard />
        </div>

        <h3 className="px-4 pb-2 pt-4 text-lg font-bold">Filter</h3>
        <div className="flex gap-3 px-4 py-3 flex-wrap">
          <FilterPill label="Date" />
          <FilterPill label="Service" />
          <div className="ml-auto flex gap-2">
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="border rounded px-2 py-1"/>
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="border rounded px-2 py-1"/>
            <button onClick={fetchData} className="px-3 py-1 bg-[#f2800d] text-white rounded">Apply</button>
          </div>
        </div>

        <ActionRow label="Download Receipts" onClick={() => alert("Use receipt button per booking")} />

        <h3 className="px-4 pb-2 pt-4 text-lg font-bold">History</h3>

        {loading && (
          <>
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse px-4 py-3">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </>
        )}

        {!loading && bookings?.length === 0 && <p className="px-4 py-4">No transactions yet</p>}

        {!loading && bookings?.map((b) => (
          <div key={b._id} className="px-4">
            <HistoryRow
              date={new Date(b.dateTime).toLocaleDateString()}
              barber={typeof b.barberId === "string" ? b.barberId : (b.barberId?.name || "Unknown")}
              amount={`₦${b.amountPaid ?? b.estimatedPrice ?? 0}`}
            />
            <div className="flex justify-end px-4 py-2">
              <a href={`/api/bookings/${b._id}/receipt`} className="text-sm text-[#f2800d]">Download receipt</a>
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

