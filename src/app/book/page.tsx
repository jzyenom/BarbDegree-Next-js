"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type ServiceItem = {
  _id: string;
  name: string;
  price: number;
  durationMinutes?: number;
};

type BarberListItem = {
  _id: string;
  name: string;
  address?: string;
  state?: string;
  country?: string;
  avatar?: string;
  serviceCount?: number;
  services?: ServiceItem[];
};

export default function ClientBookingForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const barberFromQuery = searchParams.get("barberId") ?? "";
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<BarberListItem[]>([]);
  const [barberId, setBarberId] = useState(barberFromQuery);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    dateTime: "",
    note: "",
  });
  const [step, setStep] = useState(1);

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber._id === barberId) ?? null,
    [barberId, barbers]
  );

  const selectedServices = useMemo(
    () =>
      selectedServiceIds
        .map((id) => services.find((service) => service._id === id))
        .filter((service): service is ServiceItem => Boolean(service)),
    [selectedServiceIds, services]
  );

  const estimatedPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + (service.price || 0), 0),
    [selectedServices]
  );

  useEffect(() => {
    const loadBarbers = async () => {
      const res = await fetch("/api/barbers");
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setBarbers(Array.isArray(json.barbers) ? json.barbers : []);
      }
    };

    loadBarbers();
  }, []);

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      name: previous.name || session?.user?.name || "",
      email: previous.email || session?.user?.email || "",
    }));
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    setSelectedServiceIds([]);

    if (!barberId) {
      setServices([]);
      return;
    }

    const loadServices = async () => {
      const res = await fetch(`/api/services?barberId=${barberId}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setServices(Array.isArray(json.services) ? json.services : []);
      } else {
        setServices([]);
      }
    };

    loadServices();
  }, [barberId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/bookings", {
        ...form,
        clientEmail: session?.user?.email,
        barberId,
        serviceIds: selectedServiceIds,
      });
      const booking = res.data?.booking;
      if (booking?._id) {
        router.push(`/checkout/${booking._id}`);
      }
      setForm({ name: "", email: "", address: "", dateTime: "", note: "" });
      setSelectedServiceIds([]);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : "Booking failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((previous) =>
      previous.includes(serviceId)
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId]
    );
  };

  const canGoNext =
    (step === 1 && Boolean(barberId)) ||
    (step === 2 &&
      form.name.trim() &&
      form.email.trim() &&
      form.dateTime.trim()) ||
    (step === 3 && selectedServiceIds.length > 0);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Book Appointment
          </h2>
        </div>

        <div className="flex justify-center gap-3 py-5">
          <div
            className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-[#181411]" : "bg-[#e6e0db]"}`}
          />
          <div
            className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-[#181411]" : "bg-[#e6e0db]"}`}
          />
          <div
            className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-[#181411]" : "bg-[#e6e0db]"}`}
          />
        </div>

        {!barberId && step === 1 && (
          <p className="px-4 text-sm text-red-600">
            Please pick a barber before booking.
          </p>
        )}

        <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto">
          {step === 1 && (
            <div className="px-4 py-3 space-y-3">
              <p className="text-[#181411] text-base font-medium pb-1">
                Select Barber
              </p>

              {barbers.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#e6e0db] p-4 text-sm text-[#8a7560]">
                  No barbers are available yet.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {barbers.map((barber) => (
                  <button
                    key={barber._id}
                    type="button"
                    onClick={() => setBarberId(barber._id)}
                    className={`rounded-xl border p-3 text-left ${
                      barberId === barber._id
                        ? "border-[#f2800d] bg-[#fff4ea]"
                        : "border-[#eee]"
                    }`}
                  >
                    <div className="h-20 w-full overflow-hidden rounded-lg bg-[#f5f2f0]">
                      <img
                        src={barber.avatar || "/avatar.svg"}
                        alt={barber.name || "Barber"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="pt-2 text-sm font-semibold text-[#181411]">
                      {barber.name || "Barber"}
                    </p>
                    <p className="text-xs text-[#8a7560]">
                      {barber.address ||
                        [barber.state, barber.country].filter(Boolean).join(", ")}
                    </p>
                    <p className="pt-1 text-xs text-[#8a7560]">
                      {barber.serviceCount ?? barber.services?.length ?? 0} services
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              {(["name", "email", "address"] as const).map((field) => (
                <div key={field} className="px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#181411] text-base font-medium pb-2 capitalize">
                      {field}
                    </p>
                    <input
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      placeholder={`Enter your ${field}`}
                      className="form-input w-full rounded-lg bg-[#f5f2f0] text-[#181411] p-4 h-14 placeholder:text-[#8a7560] focus:ring-0 focus:outline-0 border-none"
                      required={field !== "address"}
                    />
                  </label>
                </div>
              ))}

              <div className="px-4 py-3">
                <label className="flex flex-col">
                  <p className="text-[#181411] text-base font-medium pb-2">
                    Date and Time
                  </p>
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
            </>
          )}

          {step === 3 && (
            <div className="px-4 py-6">
              <div className="rounded-2xl bg-[#3f4a57] p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Select Services</h3>
                    <p className="text-sm text-white/70">
                      {selectedBarber?.name
                        ? `Choose from ${selectedBarber.name}'s active services`
                        : "Choose one or more services"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-white/80"
                    onClick={() => setSelectedServiceIds([])}
                  >
                    Clear
                  </button>
                </div>

                {services.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/30 p-4 text-sm text-white/80">
                    This barber has not added any active services yet.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {services.map((service) => {
                      const selected = selectedServiceIds.includes(service._id);
                      return (
                        <button
                          key={service._id}
                          type="button"
                          onClick={() => handleToggleService(service._id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                            selected
                              ? "border-white bg-white/10"
                              : "border-white/25 hover:border-white/60"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold">{service.name}</p>
                            <p className="text-xs text-white/70">
                              NGN {service.price} • {service.durationMinutes ?? 30} min
                            </p>
                          </div>
                          <span className="text-xs font-semibold">
                            {selected ? "Selected" : "Add"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {selectedServices.map((service) => (
                      <div
                        key={service._id}
                        className="flex items-center justify-between rounded-lg border border-white/30 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-white/60">
                            NGN {service.price} • {service.durationMinutes ?? 30} min
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleService(service._id)}
                          className="text-sm font-bold text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div
                  className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[132px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url('https://images.unsplash.com/photo-1595433562696-a8b4e3c5f4ef?auto=format&fit=crop&w=500&q=80')",
                  }}
                >
                  <div className="flex w-full items-end justify-between gap-4 p-4">
                    <p className="text-white text-2xl font-bold leading-tight flex-1">
                      Estimated Price: NGN {estimatedPrice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 px-4 py-6">
            <button
              type="button"
              onClick={() => setStep((previous) => Math.max(1, previous - 1))}
              disabled={step === 1}
              className="flex-1 h-12 rounded-lg bg-[#f5f2f0] text-[#181411] font-bold disabled:opacity-60"
            >
              Previous
            </button>
            {step < 3 ? (
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setStep((previous) => Math.min(3, previous + 1))}
                className="flex-1 h-12 rounded-lg bg-[#f2800d] text-[#181411] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || selectedServiceIds.length === 0}
                className="flex-1 h-12 rounded-lg bg-[#f2800d] text-[#181411] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
