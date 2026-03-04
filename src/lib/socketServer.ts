import type { Server as IOServer } from "socket.io";

const SOCKET_KEY = "socket.io.server";

export function getSocketServer() {
  const globalForSocket = globalThis as unknown as {
    [SOCKET_KEY]?: IOServer;
  };
  return globalForSocket[SOCKET_KEY] ?? null;
}

export function setSocketServer(server: IOServer) {
  const globalForSocket = globalThis as unknown as {
    [SOCKET_KEY]?: IOServer;
  };
  globalForSocket[SOCKET_KEY] = server;
}
