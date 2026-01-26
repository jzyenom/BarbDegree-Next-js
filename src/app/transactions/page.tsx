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

type Booking = {
  _id: string;
  service: string;
  dateTime: string;
  amountPaid?: number;
  estimatedPrice?: number;
  barberId?: { name?: string } | string;
  paymentStatus?: string;
};

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // fetch bookings for logged in user (server filters by session)
  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceFilter) params.set("service", serviceFilter);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const url = `/api/booking?${params.toString()}`;
      const res = await fetch(url);
      const json = await res.json();
      // our API returns { bookings } in secured version
      const data = Array.isArray(json) ? json : json.bookings ?? json;
      setBookings(data);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
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
