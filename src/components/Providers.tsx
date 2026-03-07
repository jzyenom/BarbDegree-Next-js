"use client";

import { Provider } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { store } from "@/store";
import { getSocket } from "@/lib/socketClient";
import { addNotification, fetchNotifications } from "@/features/notifications/notificationsSlice";
import type { Notification } from "@/features/notifications/notificationsSlice";
import { fetchMe } from "@/features/user/userSlice";
import { useAppDispatch } from "@/store/hooks";

/**
 * AUTO-FUNCTION-COMMENT: SocketManager
 * Purpose: Handles socket manager.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const dispatch = useAppDispatch();`.
 * 3. Executes `useEffect(() => {`.
 * 4. Executes `if (!session?.user?.id) return;`.
 * 5. Executes `fetch("/api/socket-io");`.
 * 6. Executes `dispatch(fetchNotifications());`.
 * 7. Executes `dispatch(fetchMe());`.
 * 8. Executes `const socket = getSocket();`.
 * 9. Executes `socket.emit("join", session.user.id);`.
 * 10. Executes `const onNotification = (payload: any) => {`.
 * 11. Executes `dispatch(addNotification(payload));`.
 * 12. Executes `};`.
 * 13. Executes `socket.on("notification", onNotification);`.
 * 14. Executes `return () => {`.
 * 15. Executes `socket.off("notification", onNotification);`.
 * 16. Executes `};`.
 * 17. Executes `}, [dispatch, session?.user?.id]);`.
 * 18. Executes `return null;`.
 */
function SocketManager() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/socket-io");
    dispatch(fetchNotifications());
    dispatch(fetchMe());

    const socket = getSocket();
    socket.emit("join", session.user.id);

    /**
     * AUTO-FUNCTION-COMMENT: onNotification
     * Purpose: Handles on notification.
     * Line-by-line:
     * 1. Executes `dispatch(addNotification(payload));`.
     */
    const onNotification = (payload: Notification) => {
      dispatch(addNotification(payload));
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, [dispatch, session?.user?.id]);

  return null;
}

/**
 * AUTO-FUNCTION-COMMENT: Providers
 * Purpose: Handles providers.
 * Line-by-line:
 * 1. Executes `return (`.
 * 2. Executes `<SessionProvider>`.
 * 3. Executes `<Provider store={store}>`.
 * 4. Executes `<SocketManager />`.
 * 5. Executes `{children}`.
 * 6. Executes `</Provider>`.
 * 7. Executes `</SessionProvider>`.
 * 8. Executes `);`.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <SocketManager />
        {children}
      </Provider>
    </SessionProvider>
  );
}
