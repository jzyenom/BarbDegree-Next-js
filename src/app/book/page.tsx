"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function ClientBookingForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    service: "",
    dateTime: "",
    note: "",
  });
  const [price, setPrice] = useState<number>(50); // default estimate

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/bookings", {
        ...form,
        clientEmail: session?.user?.email,
        barberId: "67500bca5c16c62d9a8f6f11", // replace with dynamic ID later
        estimatedPrice: price,
      });
      alert("Booking submitted successfully!");
      setForm({ name: "", email: "", address: "", service: "", dateTime: "", note: "" });
    } catch (err) {
      console.error(err);
      alert("Booking failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Book Appointment
          </h2>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-3 py-5">
          <div className="h-2 w-2 rounded-full bg-[#181411]"></div>
          <div className="h-2 w-2 rounded-full bg-[#e6e0db]"></div>
          <div className="h-2 w-2 rounded-full bg-[#e6e0db]"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto">
          {["name", "email", "address"].map((field) => (
            <div key={field} className="px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#181411] text-base font-medium pb-2 capitalize">{field}</p>
                <input
                  name={field}
                  value={(form as any)[field]}
                  onChange={handleChange}
                  placeholder={`Enter your ${field}`}
                  className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 placeholder:text-[#8a7560] focus:ring-0 focus:outline-0 border-none"
                  required={field !== "address"}
                />
              </label>
            </div>
          ))}

          {/* Service */}
          <div className="px-4 py-3">
            <label className="flex flex-col">
              <p className="text-[#181411] text-base font-medium pb-2">Select Service</p>
              <select
                name="service"
                value={form.service}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === "Haircut") setPrice(50);
                  if (e.target.value === "Shave") setPrice(30);
                  if (e.target.value === "Haircut + Shave") setPrice(70);
                }}
                className="form-select w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 focus:ring-0 border-none"
              >
                <option value="">Choose a service</option>
                <option value="Haircut">Haircut</option>
                <option value="Shave">Shave</option>
                <option value="Haircut + Shave">Haircut + Shave</option>
              </select>
            </label>
          </div>

          {/* Date & Time */}
          <div className="px-4 py-3">
            <label className="flex flex-col">
              <p className="text-[#181411] text-base font-medium pb-2">Date & Time</p>
              <input
                type="datetime-local"
                name="dateTime"
                value={form.dateTime}
                onChange={handleChange}
                className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 focus:ring-0 border-none"
                required
              />
            </label>
          </div>

          {/* Note */}
          <div className="px-4 py-3">
            <label className="flex flex-col">
              <p className="text-[#181411] text-base font-medium pb-2">Note</p>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Add a note (optional)"
                className="form-textarea w-full min-h-36 rounded-lg bg-[#f5f2f0] text-[#181411] p-4 placeholder:text-[#8a7560] focus:ring-0 border-none"
              />
            </label>
          </div>

          {/* Price */}
          <div className="p-4">
            <div
              className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[132px]"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url('https://images.unsplash.com/photo-1595433562696-a8b4e3c5f4ef?auto=format&fit=crop&w=500&q=80')",
              }}
            >
              <div className="flex w-full items-end justify-between gap-4 p-4">
                <p className="text-white text-2xl font-bold leading-tight flex-1">
                  Estimated Price: ${price}
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex px-4 py-3">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 justify-center rounded-lg h-12 px-5 bg-[#f2800d] text-[#181411] text-base font-bold hover:bg-[#e07000] transition-all"
            >
              {loading ? "Processing..." : "Proceed to Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
