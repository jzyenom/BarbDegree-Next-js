import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSocketServer, setSocketServer } from "@/lib/socketServer";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HTTPServer;
  };
};

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
        const token = await getToken({
          req: socket.request as NextApiRequest,
          secret: process.env.NEXTAUTH_SECRET,
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
