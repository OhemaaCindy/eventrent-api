import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { verifyAccessToken } from "./token";
import { env } from "./env";
import { assertParticipant, messageService } from "../services/messageService";

let io: Server | null = null;

function roomFor(bookingId: string): string {
  return `booking:${bookingId}`;
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") {
      next(new Error("Missing auth token"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join", async (bookingId: unknown) => {
      if (typeof bookingId !== "string") {
        socket.emit("error", "bookingId must be a string");
        return;
      }

      try {
        await assertParticipant(socket.data.userId, bookingId);
        socket.join(roomFor(bookingId));
        socket.emit("joined", bookingId);
      } catch {
        socket.emit("error", "Not authorized to join this booking's thread");
      }
    });

    socket.on("leave", (bookingId: unknown) => {
      if (typeof bookingId === "string") {
        socket.leave(roomFor(bookingId));
      }
    });

    socket.on("sendMessage", async (payload: unknown) => {
      const { bookingId, body } = (payload ?? {}) as { bookingId?: unknown; body?: unknown };
      if (typeof bookingId !== "string" || typeof body !== "string") {
        socket.emit("error", "bookingId and body are required");
        return;
      }

      try {
        // Reuses the exact same service the REST endpoint calls — validation,
        // persistence, and the broadcast below all happen in one place
        // (messageService.sendMessage), so REST- and socket-sent messages
        // are indistinguishable to everyone else in the room.
        await messageService.sendMessage(socket.data.userId, bookingId, body);
      } catch (err) {
        socket.emit("error", err instanceof Error ? err.message : "Failed to send message");
      }
    });
  });

  return io;
}

export function emitNewMessage(bookingId: string, message: unknown): void {
  io?.to(roomFor(bookingId)).emit("message", message);
}
