/**
 * AUTO-FILE-COMMENT: src/pages/api/socket-io.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSocketServer, setSocketServer } from "@/lib/socketServer";
import { getNextAuthSecret } from "@/lib/env";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HTTPServer;
  };
};

/**
 * AUTO-FUNCTION-COMMENT: handler
 * Purpose: Handles handler.
 * Line-by-line:
 * 1. Executes `if (!res.socket) {`.
 * 2. Executes `res.status(500).end();`.
 * 3. Executes `return;`.
 * 4. Executes `}`.
 * 5. Executes `if (!getSocketServer()) {`.
 * 6. Executes `const io = new Server(res.socket.server, {`.
 * 7. Executes `path: "/api/socket-io",`.
 * 8. Executes `addTrailingSlash: false,`.
 * 9. Executes `});`.
 * 10. Executes `io.use(async (socket, next) => {`.
 * 11. Executes `try {`.
 * 12. Executes `const token = await getToken({`.
 * 13. Executes `req: socket.request as NextApiRequest,`.
 * 14. Executes `secret: process.env.NEXTAUTH_SECRET,`.
 * 15. Executes `});`.
 * 16. Executes `const email =`.
 * 17. Executes `typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";`.
 * 18. Executes `if (!email) {`.
 * 19. Executes `return next(new Error("Unauthorized"));`.
 * 20. Executes `}`.
 * 21. Executes `await connectToDatabase();`.
 * 22. Executes `const user = await User.findOne({ email }).select("_id");`.
 * 23. Executes `if (!user?._id) {`.
 * 24. Executes `return next(new Error("Unauthorized"));`.
 * 25. Executes `}`.
 * 26. Executes `socket.data.userId = user._id.toString();`.
 * 27. Executes `next();`.
 * 28. Executes `} catch {`.
 * 29. Executes `next(new Error("Unauthorized"));`.
 * 30. Executes `}`.
 * 31. Executes `});`.
 * 32. Executes `io.on("connection", (socket) => {`.
 * 33. Executes `const authenticatedUserId =`.
 * 34. Executes `typeof socket.data.userId === "string" ? socket.data.userId : "";`.
 * 35. Executes `if (!authenticatedUserId) {`.
 * 36. Executes `socket.disconnect();`.
 * 37. Executes `return;`.
 * 38. Executes `}`.
 * 39. Executes `socket.join(authenticatedUserId);`.
 * 40. Executes `socket.on("join", (userId: string) => {`.
 * 41. Executes `if (userId && userId === authenticatedUserId) {`.
 * 42. Executes `socket.join(userId);`.
 * 43. Executes `}`.
 * 44. Executes `});`.
 * 45. Executes `});`.
 * 46. Executes `setSocketServer(io);`.
 * 47. Executes `}`.
 * 48. Executes `res.end();`.
 */
export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket) {
    res.status(500).end();
    return;
  }

  if (!getSocketServer()) {
    const io = new Server(res.socket.server, {
      path: "/api/socket-io",
      addTrailingSlash: false,
    });

    io.use(async (socket, next) => {
      try {
        const secret = getNextAuthSecret();
        if (!secret) {
          return next(new Error("Auth secret not configured"));
        }

        const token = await getToken({
          req: socket.request as NextApiRequest,
          secret,
        });
        const email =
          typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";

        if (!email) {
          return next(new Error("Unauthorized"));
        }

        await connectToDatabase();
        const user = await User.findOne({ email }).select("_id");
        if (!user?._id) {
          return next(new Error("Unauthorized"));
        }

        socket.data.userId = user._id.toString();
        next();
      } catch {
        next(new Error("Unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      const authenticatedUserId =
        typeof socket.data.userId === "string" ? socket.data.userId : "";

      if (!authenticatedUserId) {
        socket.disconnect();
        return;
      }

      socket.join(authenticatedUserId);

      socket.on("join", (userId: string) => {
        if (userId && userId === authenticatedUserId) {
          socket.join(userId);
        }
      });
    });

    setSocketServer(io);
  }

  res.end();
}
