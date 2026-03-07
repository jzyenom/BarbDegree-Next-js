/**
 * AUTO-FILE-COMMENT: src/app/dashboard/barber/services/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: BarberServicesPage
 * Purpose: Handles barber services page.
 * Line-by-line:
 * 1. Executes `const dispatch = useAppDispatch();`.
 * 2. Executes `const { items, loading, error } = useAppSelector((state) => state.services);`.
 * 3. Executes `const subscription = useAppSelector((state) => state.subscription);`.
 * 4. Executes `const [form, setForm] = useState({`.
 * 5. Executes `name: "",`.
 * 6. Executes `description: "",`.
 * 7. Executes `price: "",`.
 * 8. Executes `durationMinutes: "",`.
 * 9. Executes `});`.
 * 10. Executes `useEffect(() => {`.
 * 11. Executes `dispatch(fetchServices());`.
 * 12. Executes `dispatch(fetchSubscription());`.
 * 13. Executes `}, [dispatch]);`.
 * 14. Executes `const handleSubmit = async (e: React.FormEvent) => {`.
 * 15. Executes `e.preventDefault();`.
 * 16. Executes `try {`.
 * 17. Executes `await dispatch(`.
 * 18. Executes `createService({`.
 * 19. Executes `name: form.name,`.
 * 20. Executes `description: form.description,`.
 * 21. Executes `price: Number(form.price),`.
 * 22. Executes `durationMinutes: Number(form.durationMinutes || 30),`.
 * 23. Executes `isActive: true,`.
 * 24. Executes `})`.
 * 25. Executes `).unwrap();`.
 * 26. Executes `setForm({ name: "", description: "", price: "", durationMinutes: "" });`.
 * 27. Executes `} catch {`.
 * 28. Executes `// Slice error state is rendered below.`.
 * 29. Executes `}`.
 * 30. Executes `};`.
 * 31. Executes `return (`.
 * 32. Executes `<div className="min-h-screen bg-white text-[#f2800d] pb-24">`.
 * 33. Executes `<BarberHeader title="Services" />`.
 * 34. Executes `<div className="p-4 max-w-[640px] mx-auto space-y-6">`.
 * 35. Executes `<div className="border rounded-lg p-3 text-sm">`.
 * 36. Executes `Subscription status:{" "}`.
 * 37. Executes `{subscription.isSubscribed ? "Subscribed" : "Not subscribed"}`.
 * 38. Executes `</div>`.
 * 39. Executes `{error && (`.
 * 40. Executes `<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">`.
 * 41. Executes `{error}`.
 * 42. Executes `</div>`.
 * 43. Executes `)}`.
 * 44. Executes `<form onSubmit={handleSubmit} className="space-y-3">`.
 * 45. Executes `<input`.
 * 46. Executes `className="w-full border rounded-lg p-3"`.
 * 47. Executes `placeholder="Service name"`.
 * 48. Executes `value={form.name}`.
 * 49. Executes `onChange={(e) => setForm({ ...form, name: e.target.value })}`.
 * 50. Executes `required`.
 * 51. Executes `/>`.
 * 52. Executes `<input`.
 * 53. Executes `className="w-full border rounded-lg p-3"`.
 * 54. Executes `placeholder="Description"`.
 * 55. Executes `value={form.description}`.
 * 56. Executes `onChange={(e) => setForm({ ...form, description: e.target.value })}`.
 * 57. Executes `/>`.
 * 58. Executes `<input`.
 * 59. Executes `className="w-full border rounded-lg p-3"`.
 * 60. Executes `placeholder="Price"`.
 * 61. Executes `type="number"`.
 * 62. Executes `value={form.price}`.
 * 63. Executes `onChange={(e) => setForm({ ...form, price: e.target.value })}`.
 * 64. Executes `required`.
 * 65. Executes `/>`.
 * 66. Executes `<input`.
 * 67. Executes `className="w-full border rounded-lg p-3"`.
 * 68. Executes `placeholder="Duration (minutes)"`.
 * 69. Executes `type="number"`.
 * 70. Executes `value={form.durationMinutes}`.
 * 71. Executes `onChange={(e) =>`.
 * 72. Executes `setForm({ ...form, durationMinutes: e.target.value })`.
 * 73. Executes `}`.
 * 74. Executes `/>`.
 * 75. Executes `<button className="w-full h-12 rounded-lg bg-[#f2800d] text-white font-bold">`.
 * 76. Executes `Add Service`.
 * 77. Executes `</button>`.
 * 78. Executes `</form>`.
 * 79. Executes `<div className="space-y-3">`.
 * 80. Executes `{loading && <p>Loading services...</p>}`.
 * 81. Executes `{!loading &&`.
 * 82. Executes `items.map((service) => (`.
 * 83. Executes `<div`.
 * 84. Executes `key={service._id}`.
 * 85. Executes `className="border rounded-lg p-3 flex items-center justify-between"`.
 * 86. Executes `>`.
 * 87. Executes `<div>`.
 * 88. Executes `<div className="font-semibold">{service.name}</div>`.
 * 89. Executes `<div className="text-sm text-gray-500">`.
 * 90. Executes `{service.description || "No description"}`.
 * 91. Executes `</div>`.
 * 92. Executes `<div className="text-sm text-gray-500">`.
 * 93. Executes `{service.price} NGN - {service.durationMinutes} min`.
 * 94. Executes `</div>`.
 * 95. Executes `</div>`.
 * 96. Executes `<div className="flex gap-2">`.
 * 97. Executes `<button`.
 * 98. Executes `className="px-3 py-1 rounded border"`.
 * 99. Executes `onClick={() =>`.
 * 100. Executes `dispatch(`.
 * 101. Executes `updateService({`.
 * 102. Executes `id: service._id,`.
 * 103. Executes `data: { isActive: !service.isActive },`.
 * 104. Executes `})`.
 * 105. Executes `)`.
 * 106. Executes `}`.
 * 107. Executes `>`.
 * 108. Executes `{service.isActive ? "Disable" : "Enable"}`.
 * 109. Executes `</button>`.
 * 110. Executes `<button`.
 * 111. Executes `className="px-3 py-1 rounded border text-red-600"`.
 * 112. Executes `onClick={() => dispatch(deleteService(service._id))}`.
 * 113. Executes `>`.
 * 114. Executes `Delete`.
 * 115. Executes `</button>`.
 * 116. Executes `</div>`.
 * 117. Executes `</div>`.
 * 118. Executes `))}`.
 * 119. Executes `</div>`.
 * 120. Executes `</div>`.
 * 121. Executes `<BottomNav items={barberNavItems} activeItem="Services" />`.
 * 122. Executes `</div>`.
 * 123. Executes `);`.
 */
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

  /**
   * AUTO-FUNCTION-COMMENT: handleSubmit
   * Purpose: Handles handle submit.
   * Line-by-line:
   * 1. Executes `e.preventDefault();`.
   * 2. Executes `try {`.
   * 3. Executes `await dispatch(`.
   * 4. Executes `createService({`.
   * 5. Executes `name: form.name,`.
   * 6. Executes `description: form.description,`.
   * 7. Executes `price: Number(form.price),`.
   * 8. Executes `durationMinutes: Number(form.durationMinutes || 30),`.
   * 9. Executes `isActive: true,`.
   * 10. Executes `})`.
   * 11. Executes `).unwrap();`.
   * 12. Executes `setForm({ name: "", description: "", price: "", durationMinutes: "" });`.
   * 13. Executes `} catch {`.
   * 14. Executes `// Slice error state is rendered below.`.
   * 15. Executes `}`.
   */
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
