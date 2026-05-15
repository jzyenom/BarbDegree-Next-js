"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { createService } from "@/features/services/servicesSlice";
import BarberHeader from "@/components/Barber/BarberHeader";
import BottomNav, { barberNavItems } from "@/components/BottomNav";

/**
 * AUTO-FUNCTION-COMMENT: AddServicePage
 * Purpose: Handles add service page.
 * Line-by-line:
 * 1. Executes `const router = useRouter();`.
 * 2. Executes `const dispatch = useAppDispatch();`.
 * 3. Executes `const [form, setForm] = useState({`.
 * 4. Executes `name: "",`.
 * 5. Executes `description: "",`.
 * 6. Executes `price: "",`.
 * 7. Executes `durationMinutes: "",`.
 * 8. Executes `});`.
 * 9. Executes `const [loading, setLoading] = useState(false);`.
 * 10. Executes `const [error, setError] = useState("");`.
 * 11. Executes `const handleSubmit = async (e: React.FormEvent) => {`.
 * 12. Executes `e.preventDefault();`.
 * 13. Executes `setError("");`.
 * 14. Executes `setLoading(true);`.
 * 15. Executes `try {`.
 * 16. Executes `await dispatch(`.
 * 17. Executes `createService({`.
 * 18. Executes `name: form.name,`.
 * 19. Executes `description: form.description,`.
 * 20. Executes `price: Number(form.price),`.
 * 21. Executes `durationMinutes: Number(form.durationMinutes || 30),`.
 * 22. Executes `isActive: true,`.
 * 23. Executes `})`.
 * 24. Executes `).unwrap();`.
 * 25. Executes `router.push("/dashboard/barber/services");`.
 * 26. Executes `} catch (err: any) {`.
 * 27. Executes `setError(err.message || "Failed to add service");`.
 * 28. Executes `} finally {`.
 * 29. Executes `setLoading(false);`.
 * 30. Executes `}`.
 * 31. Executes `};`.
 * 32. Executes `return (`.
 * 33. Executes `<div className="min-h-screen bg-white text-[#f2800d] pb-24">`.
 * 34. Executes `<BarberHeader title="Add Service" />`.
 * 35. Executes `<div className="p-4 max-w-[640px] mx-auto">`.
 * 36. Executes `{error && (`.
 * 37. Executes `<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">`.
 * 38. Executes `{error}`.
 * 39. Executes `</div>`.
 * 40. Executes `)}`.
 * 41. Executes `<form onSubmit={handleSubmit} className="space-y-4">`.
 * 42. Executes `<input`.
 * 43. Executes `className="w-full border rounded-lg p-3"`.
 * 44. Executes `placeholder="Service name"`.
 * 45. Executes `value={form.name}`.
 * 46. Executes `onChange={(e) => setForm({ ...form, name: e.target.value })}`.
 * 47. Executes `required`.
 * 48. Executes `/>`.
 * 49. Executes `<textarea`.
 * 50. Executes `className="w-full border rounded-lg p-3"`.
 * 51. Executes `placeholder="Description"`.
 * 52. Executes `value={form.description}`.
 * 53. Executes `onChange={(e) => setForm({ ...form, description: e.target.value })}`.
 * 54. Executes `rows={3}`.
 * 55. Executes `/>`.
 * 56. Executes `<input`.
 * 57. Executes `className="w-full border rounded-lg p-3"`.
 * 58. Executes `placeholder="Price (NGN)"`.
 * 59. Executes `type="number"`.
 * 60. Executes `value={form.price}`.
 * 61. Executes `onChange={(e) => setForm({ ...form, price: e.target.value })}`.
 * 62. Executes `required`.
 * 63. Executes `/>`.
 * 64. Executes `<input`.
 * 65. Executes `className="w-full border rounded-lg p-3"`.
 * 66. Executes `placeholder="Duration (minutes)"`.
 * 67. Executes `type="number"`.
 * 68. Executes `value={form.durationMinutes}`.
 * 69. Executes `onChange={(e) =>`.
 * 70. Executes `setForm({ ...form, durationMinutes: e.target.value })`.
 * 71. Executes `}`.
 * 72. Executes `/>`.
 * 73. Executes `<button`.
 * 74. Executes `className="w-full h-12 rounded-lg bg-[#f2800d] text-white font-bold disabled:opacity-50"`.
 * 75. Executes `disabled={loading}`.
 * 76. Executes `>`.
 * 77. Executes `{loading ? "Adding..." : "Add Service"}`.
 * 78. Executes `</button>`.
 * 79. Executes `</form>`.
 * 80. Executes `</div>`.
 * 81. Executes `<BottomNav items={barberNavItems} activeItem="Services" />`.
 * 82. Executes `</div>`.
 * 83. Executes `);`.
 */
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
    <div className="min-h-screen bg-white text-[#f2800d] pb-24">
      <BarberHeader title="Add Service" />
      <div className="p-4 max-w-[640px] mx-auto">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            className="w-full border rounded-lg p-3"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Price (NGN)"
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
          <button
            className="w-full h-12 rounded-lg bg-[#f2800d] text-white font-bold disabled:opacity-50"
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