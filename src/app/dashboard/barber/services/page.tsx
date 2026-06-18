"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from "@/features/services/servicesSlice";
import BarberHeader from "@/components/Barber/BarberHeader";
import { fetchSubscription } from "@/features/subscription/subscriptionSlice";
import BottomNav, { barberNavItems } from "@/components/BottomNav";


export default function BarberServicesPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.services);
  const subscription = useAppSelector((state) => state.subscription);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
  });

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchSubscription());
  }, [dispatch]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createService({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          durationMinutes: Number(form.durationMinutes || 30),
          isActive: true,
        })
      ).unwrap();
      setForm({ name: "", description: "", price: "", durationMinutes: "" });
    } catch {
      // Slice error state is rendered below.
    }
  };

  return (
    <div className="mobile-screen mobile-shell flex flex-col bg-white text-[#f2800d]">
      <BarberHeader title="Services" />

      <div className="mobile-scroll mx-auto w-full max-w-[640px] space-y-4 p-4 pb-20">
        <div className="border rounded-lg p-3 text-sm">
          Subscription status:{" "}
          {subscription.isSubscribed ? "Subscribed" : "Not subscribed"}
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* show an input field */}
          <input
            className="w-full rounded-lg border p-2.5"
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {/* show an input field */}
          <input
            className="w-full rounded-lg border p-2.5"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {/* show an input field */}
          <input
            className="w-full rounded-lg border p-2.5"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          {/* show an input field */}
          <input
            className="w-full rounded-lg border p-2.5"
            placeholder="Duration (minutes)"
            type="number"
            value={form.durationMinutes}
            onChange={(e) =>
              setForm({ ...form, durationMinutes: e.target.value })
            }
          />
          <button className="h-11 w-full rounded-lg bg-[#f2800d] font-bold text-white">
            Add Service
          </button>
        </form>

        <div className="space-y-3">
          {loading && <p>Loading services...</p>}
          {!loading &&
            items.map((service) => (
              <div
                key={service._id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-gray-500">
                    {service.description || "No description"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {service.price} NGN - {service.durationMinutes} min
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    className="px-3 py-1 rounded border"
                    onClick={() =>
                      dispatch(
                        updateService({
                          id: service._id,
                          data: { isActive: !service.isActive },
                        })
                      )
                    }
                  >
                    {service.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="px-3 py-1 rounded border text-red-600"
                    onClick={() => dispatch(deleteService(service._id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      <BottomNav items={barberNavItems} activeItem="Services" />
    </div>
  );
}
