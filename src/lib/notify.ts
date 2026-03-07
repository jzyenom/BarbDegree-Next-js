import Notification from "@/models/Notification";
import { getSocketServer } from "@/lib/socketServer";

type NotifyInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: Record<string, unknown>;
};

/**
 * AUTO-FUNCTION-COMMENT: notifyUser
 * Purpose: Handles notify user.
 * Line-by-line:
 * 1. Executes `const notification = await Notification.create({`.
 * 2. Executes `userId: input.userId,`.
 * 3. Executes `title: input.title,`.
 * 4. Executes `message: input.message,`.
 * 5. Executes `type: input.type ?? "info",`.
 * 6. Executes `data: input.data ?? {},`.
 * 7. Executes `});`.
 * 8. Executes `const io = getSocketServer();`.
 * 9. Executes `if (io) {`.
 * 10. Executes `io.to(input.userId).emit("notification", notification);`.
 * 11. Executes `}`.
 * 12. Executes `return notification;`.
 */
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
