"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { createService } from "@/features/services/servicesSlice";
import BarberHeader from "@/components/Barber/BarberHeader";
import BottomNav, { barberNavItems } from "@/components/BottomNav";


export default function AddServicePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      router.push("/dashboard/barber/services");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-screen mobile-shell flex flex-col bg-white text-[#f2800d]">
      <BarberHeader title="Add Service" />
      <div className="mobile-scroll mx-auto w-full max-w-[640px] p-4 pb-20">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* show an input field */}
          <input
            className="w-full rounded-lg border p-2.5"
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {/* show textarea */}
          <textarea
            className="w-full rounded-lg border p-2.5"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          {/* show an input field */}
          <input
            className="w-full rounded-lg border p-2.5"
            placeholder="Price (NGN)"
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
          <button
            className="h-11 w-full rounded-lg bg-[#f2800d] font-bold text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Service"}
          </button>
        </form>
      </div>
      <BottomNav items={barberNavItems} activeItem="Services" />
    </div>
  );
}
