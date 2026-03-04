"use client";

import { useEffect } from "react";
import BarberHeader from "@/components/Barber/BarberHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminBarbers,
  updateAdminBarberSubscription,
} from "@/features/admin/adminBarbersSlice";

export default function AdminSubscriptionsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.adminBarbers);

  useEffect(() => {
    dispatch(fetchAdminBarbers());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      <BarberHeader title="Subscriptions" />

      <div className="p-4 space-y-4">
        {loading && <p>Loading barbers...</p>}
        {!loading && items.length === 0 && <p>No barbers found.</p>}

        {!loading &&
          items.map((barber) => (
            <div key={barber._id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {barber.userId?.name || "Barber"}
                </div>
                <div className="text-sm text-gray-500">
                  {barber.userId?.email || "No email"}
                </div>
              </div>
              <button
                className={`px-3 py-1 rounded ${
                  barber.isSubscribed ? "bg-green-600 text-white" : "border"
                }`}
                onClick={() =>
                  dispatch(
                    updateAdminBarberSubscription({
                      barberId: barber._id,
                      isSubscribed: !barber.isSubscribed,
                    })
                  )
                }
              >
                {barber.isSubscribed ? "Subscribed" : "Not subscribed"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
