/**
 * AUTO-FILE-COMMENT: src/app/dashboard/admin/subscriptions/page.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { useEffect } from "react";
import BarberHeader from "@/components/Barber/BarberHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminBarbers,
  updateAdminBarberSubscription,
} from "@/features/admin/adminBarbersSlice";

/**
 * AUTO-FUNCTION-COMMENT: AdminSubscriptionsPage
 * Purpose: Handles admin subscriptions page.
 * Line-by-line:
 * 1. Executes `const dispatch = useAppDispatch();`.
 * 2. Executes `const { items, loading } = useAppSelector((state) => state.adminBarbers);`.
 * 3. Executes `useEffect(() => {`.
 * 4. Executes `dispatch(fetchAdminBarbers());`.
 * 5. Executes `}, [dispatch]);`.
 * 6. Executes `return (`.
 * 7. Executes `<div className="min-h-screen bg-white">`.
 * 8. Executes `<BarberHeader title="Subscriptions" />`.
 * 9. Executes `<div className="p-4 space-y-4">`.
 * 10. Executes `{loading && <p>Loading barbers...</p>}`.
 * 11. Executes `{!loading && items.length === 0 && <p>No barbers found.</p>}`.
 * 12. Executes `{!loading &&`.
 * 13. Executes `items.map((barber) => (`.
 * 14. Executes `<div key={barber._id} className="border rounded-lg p-3 flex items-center justify-between">`.
 * 15. Executes `<div>`.
 * 16. Executes `<div className="font-semibold">`.
 * 17. Executes `{barber.userId?.name || "Barber"}`.
 * 18. Executes `</div>`.
 * 19. Executes `<div className="text-sm text-gray-500">`.
 * 20. Executes `{barber.userId?.email || "No email"}`.
 * 21. Executes `</div>`.
 * 22. Executes `</div>`.
 * 23. Executes `<button`.
 * 24. Executes `className={\`px-3 py-1 rounded ${`.
 * 25. Executes `barber.isSubscribed ? "bg-green-600 text-white" : "border"`.
 * 26. Executes `}\`}`.
 * 27. Executes `onClick={() =>`.
 * 28. Executes `dispatch(`.
 * 29. Executes `updateAdminBarberSubscription({`.
 * 30. Executes `barberId: barber._id,`.
 * 31. Executes `isSubscribed: !barber.isSubscribed,`.
 * 32. Executes `})`.
 * 33. Executes `)`.
 * 34. Executes `}`.
 * 35. Executes `>`.
 * 36. Executes `{barber.isSubscribed ? "Subscribed" : "Not subscribed"}`.
 * 37. Executes `</button>`.
 * 38. Executes `</div>`.
 * 39. Executes `))}`.
 * 40. Executes `</div>`.
 * 41. Executes `</div>`.
 * 42. Executes `);`.
 */
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
