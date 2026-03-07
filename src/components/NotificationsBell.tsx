/**
 * AUTO-FILE-COMMENT: src/components/NotificationsBell.tsx
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { markNotificationRead } from "@/features/notifications/notificationsSlice";
import type { Notification } from "@/features/notifications/notificationsSlice";

/**
 * AUTO-FUNCTION-COMMENT: extractBookingId
 * Purpose: Handles extract booking id.
 * Line-by-line:
 * 1. Executes `const raw = notification?.data?.bookingId;`.
 * 2. Executes `if (!raw) return "";`.
 * 3. Executes `if (typeof raw === "string") return raw;`.
 * 4. Executes `return raw._id || raw.$oid || "";`.
 */
function extractBookingId(notification: Notification | null): string {
  const raw = notification?.data?.bookingId;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return raw._id || raw.$oid || "";
}

/**
 * AUTO-FUNCTION-COMMENT: NotificationsBell
 * Purpose: Handles notifications bell.
 * Line-by-line:
 * 1. Executes `const [open, setOpen] = useState(false);`.
 * 2. Executes `const [selectedId, setSelectedId] = useState<string | null>(null);`.
 * 3. Executes `const dispatch = useAppDispatch();`.
 * 4. Executes `const notifications = useAppSelector((state) => state.notifications.items);`.
 * 5. Executes `const unreadCount = notifications.filter((n) => !n.read).length;`.
 * 6. Executes `const selectedNotification = useMemo(`.
 * 7. Executes `() => notifications.find((n) => n._id === selectedId) ?? null,`.
 * 8. Executes `[notifications, selectedId]`.
 * 9. Executes `);`.
 * 10. Executes `const bookingId = useMemo(() => {`.
 * 11. Executes `const raw = (selectedNotification as any)?.data?.bookingId;`.
 * 12. Executes `if (!raw) return "";`.
 * 13. Executes `if (typeof raw === "string") return raw;`.
 * 14. Executes `if (typeof raw === "object") {`.
 * 15. Executes `return raw._id || raw.$oid || "";`.
 * 16. Executes `}`.
 * 17. Executes `return "";`.
 * 18. Executes `}, [selectedNotification]);`.
 * 19. Executes `const handleSelect = (id: string) => {`.
 * 20. Executes `setSelectedId(id);`.
 * 21. Executes `dispatch(markNotificationRead(id));`.
 * 22. Executes `};`.
 * 23. Executes `return (`.
 * 24. Executes `<div className="relative">`.
 * 25. Executes `<button`.
 * 26. Executes `onClick={() => setOpen((prev) => !prev)}`.
 * 27. Executes `className="relative p-2 rounded-full"`.
 * 28. Executes `aria-label="Notifications"`.
 * 29. Executes `>`.
 * 30. Executes `<Bell className="w-5 h-5" />`.
 * 31. Executes `{unreadCount > 0 && (`.
 * 32. Executes `<span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background-light dark:ring-background-dark" />`.
 * 33. Executes `)}`.
 * 34. Executes `</button>`.
 * 35. Executes `{open && (`.
 * 36. Executes `<div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-20">`.
 * 37. Executes `<div className="px-3 py-2 text-sm font-semibold">Notifications</div>`.
 * 38. Executes `<div className="max-h-72 overflow-auto border-t">`.
 * 39. Executes `{notifications.length === 0 && (`.
 * 40. Executes `<div className="px-3 py-4 text-sm text-gray-500">`.
 * 41. Executes `No notifications`.
 * 42. Executes `</div>`.
 * 43. Executes `)}`.
 * 44. Executes `{notifications.map((n) => (`.
 * 45. Executes `<button`.
 * 46. Executes `key={n._id}`.
 * 47. Executes `onClick={() => handleSelect(n._id)}`.
 * 48. Executes `className={\`w-full text-left px-3 py-2 text-sm border-b ${`.
 * 49. Executes `n.read ? "text-gray-500" : "text-gray-900"`.
 * 50. Executes `} ${selectedId === n._id ? "bg-gray-50" : ""}\`}`.
 * 51. Executes `>`.
 * 52. Executes `<div className="font-medium">{n.title}</div>`.
 * 53. Executes `<div className="text-xs">{n.message}</div>`.
 * 54. Executes `</button>`.
 * 55. Executes `))}`.
 * 56. Executes `</div>`.
 * 57. Executes `{selectedNotification && (`.
 * 58. Executes `<div className="px-3 py-3 space-y-2">`.
 * 59. Executes `<div className="text-sm font-semibold">Details</div>`.
 * 60. Executes `<div className="text-sm text-gray-800">`.
 * 61. Executes `{selectedNotification.message}`.
 * 62. Executes `</div>`.
 * 63. Executes `{selectedNotification.createdAt && (`.
 * 64. Executes `<div className="text-xs text-gray-500">`.
 * 65. Executes `{new Date(selectedNotification.createdAt).toLocaleString()}`.
 * 66. Executes `</div>`.
 * 67. Executes `)}`.
 * 68. Executes `{bookingId && (`.
 * 69. Executes `<Link`.
 * 70. Executes `href={\`/bookings/${bookingId}\`}`.
 * 71. Executes `className="inline-flex items-center text-sm font-medium text-orange-600"`.
 * 72. Executes `>`.
 * 73. Executes `View booking`.
 * 74. Executes `</Link>`.
 * 75. Executes `)}`.
 * 76. Executes `</div>`.
 * 77. Executes `)}`.
 * 78. Executes `</div>`.
 * 79. Executes `)}`.
 * 80. Executes `</div>`.
 * 81. Executes `);`.
 */
export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const selectedNotification = useMemo(
    () => notifications.find((n) => n._id === selectedId) ?? null,
    [notifications, selectedId]
  );

  const bookingId = useMemo(
    () => extractBookingId(selectedNotification),
    [selectedNotification]
  );

  /**
   * AUTO-FUNCTION-COMMENT: handleSelect
   * Purpose: Handles handle select.
   * Line-by-line:
   * 1. Executes `setSelectedId(id);`.
   * 2. Executes `dispatch(markNotificationRead(id));`.
   */
  const handleSelect = (id: string) => {
    setSelectedId(id);
    dispatch(markNotificationRead(id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background-light dark:ring-background-dark" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
          <div className="px-3 py-2 text-sm font-semibold">Notifications</div>
          <div className="max-h-72 overflow-auto border-t">
            {notifications.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500">
                No notifications
              </div>
            )}
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleSelect(n._id)}
                className={`w-full text-left px-3 py-2 text-sm border-b ${
                  n.read ? "text-gray-500" : "text-gray-900"
                } ${selectedId === n._id ? "bg-gray-50" : ""}`}
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-xs">{n.message}</div>
              </button>
            ))}
          </div>

          {selectedNotification && (
            <div className="px-3 py-3 space-y-2">
              <div className="text-sm font-semibold">Details</div>
              <div className="text-sm text-gray-800">
                {selectedNotification.message}
              </div>
              {selectedNotification.createdAt && (
                <div className="text-xs text-gray-500">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </div>
              )}
              {bookingId && (
                <Link
                  href={`/bookings/${bookingId}`}
                  className="inline-flex items-center text-sm font-medium text-orange-600"
                >
                  View booking
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
