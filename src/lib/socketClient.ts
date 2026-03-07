import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * AUTO-FUNCTION-COMMENT: getSocket
 * Purpose: Handles get socket.
 * Line-by-line:
 * 1. Executes `if (!socket) {`.
 * 2. Executes `socket = io({`.
 * 3. Executes `path: "/api/socket-io",`.
 * 4. Executes `});`.
 * 5. Executes `}`.
 * 6. Executes `return socket;`.
 */
export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket-io",
    });
  }
  return socket;
}
