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
    <div className="min-h-screen bg-white text-[#f2800d] pb-24">
      <BarberHeader title="Services" />

      <div className="p-4 max-w-[640px] mx-auto space-y-6">
        <div className="border rounded-lg p-3 text-sm">
          Subscription status:{" "}
          {subscription.isSubscribed ? "Subscribed" : "Not subscribed"}
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Duration (minutes)"
            type="number"
            value={form.durationMinutes}
            onChange={(e) =>
              setForm({ ...form, durationMinutes: e.target.value })
            }
          />
          <button className="w-full h-12 rounded-lg bg-[#f2800d] text-white font-bold">
            Add Service
          </button>
        </form>

        <div className="space-y-3">
          {loading && <p>Loading services...</p>}
          {!loading &&
            items.map((service) => (
              <div
                key={service._id}
                className="border rounded-lg p-3 flex items-center justify-between"
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
                <div className="flex gap-2">
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
