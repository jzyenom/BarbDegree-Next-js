import Notification from "@/models/Notification";
import { getSocketServer } from "@/lib/socketServer";

type NotifyInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: Record<string, unknown>;
};

export async function notifyUser(input: NotifyInput) {
  const notification = await Notification.create({
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type ?? "info",
    data: input.data ?? {},
  });

  const io = getSocketServer();
  if (io) {
    io.to(input.userId).emit("notification", notification);
  }

  return notification;
}
