import type { Server as IOServer } from "socket.io";

const SOCKET_KEY = "socket.io.server";

/**
 * AUTO-FUNCTION-COMMENT: getSocketServer
 * Purpose: Handles get socket server.
 * Line-by-line:
 * 1. Executes `const globalForSocket = globalThis as unknown as {`.
 * 2. Executes `[SOCKET_KEY]?: IOServer;`.
 * 3. Executes `};`.
 * 4. Executes `return globalForSocket[SOCKET_KEY] ?? null;`.
 */
export function getSocketServer() {
  const globalForSocket = globalThis as unknown as {
    [SOCKET_KEY]?: IOServer;
  };
  return globalForSocket[SOCKET_KEY] ?? null;
}

/**
 * AUTO-FUNCTION-COMMENT: setSocketServer
 * Purpose: Handles set socket server.
 * Line-by-line:
 * 1. Executes `const globalForSocket = globalThis as unknown as {`.
 * 2. Executes `[SOCKET_KEY]?: IOServer;`.
 * 3. Executes `};`.
 * 4. Executes `globalForSocket[SOCKET_KEY] = server;`.
 */
export function setSocketServer(server: IOServer) {
  const globalForSocket = globalThis as unknown as {
    [SOCKET_KEY]?: IOServer;
  };
  globalForSocket[SOCKET_KEY] = server;
}
