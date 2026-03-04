"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { markNotificationRead } from "@/features/notifications/notificationsSlice";

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

  const bookingId = useMemo(() => {
    const raw = (selectedNotification as any)?.data?.bookingId;
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (typeof raw === "object") {
      return raw._id || raw.$oid || "";
    }
    return "";
  }, [selectedNotification]);

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
