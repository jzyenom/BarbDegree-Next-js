import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { getSocketServer, setSocketServer } from "@/lib/socketServer";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    res.status(500).end();
    return;
  }

  if (!getSocketServer()) {
    const io = new Server(res.socket.server, {
      path: "/api/socket-io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("join", (userId: string) => {
        if (userId) {
          socket.join(userId);
        }
      });
    });

    setSocketServer(io);
  }

  res.end();
}
