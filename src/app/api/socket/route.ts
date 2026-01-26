import { NextResponse } from "next/server";
import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(userId); // join user room
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;