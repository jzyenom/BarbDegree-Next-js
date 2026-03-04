"use client";

import { Provider } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { store } from "@/store";
import { getSocket } from "@/lib/socketClient";
import { addNotification, fetchNotifications } from "@/features/notifications/notificationsSlice";
import { fetchMe } from "@/features/user/userSlice";
import { useAppDispatch } from "@/store/hooks";

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

    const onNotification = (payload: any) => {
      dispatch(addNotification(payload));
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, [dispatch, session?.user?.id]);

  return null;
}

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
