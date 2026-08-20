import { prisma } from "../lib/prisma";
import { messageRepository } from "../repositories/messageRepository";
import { AppError } from "../middleware/errorHandler";
import { emitNewMessage } from "../lib/socket";

export async function assertParticipant(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { include: { owner: true } } },
  });
  if (!booking) {
    throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found");
  }

  const isRenter = booking.renterId === userId;
  const isOwner = booking.listing.owner.userId === userId;
  if (!isRenter && !isOwner) {
    throw new AppError(403, "NOT_BOOKING_PARTICIPANT", "You are not a participant in this booking");
  }

  return booking;
}

export const messageService = {
  async sendMessage(userId: string, bookingId: string, body: string) {
    await assertParticipant(userId, bookingId);
    const message = await messageRepository.create(bookingId, userId, body);

    // Broadcast regardless of whether this call came from the REST endpoint
    // or a socket "sendMessage" event — every message creates exactly one
    // real-time push, from a single place.
    emitNewMessage(bookingId, message);

    return message;
  },

  async listMessages(userId: string, bookingId: string) {
    await assertParticipant(userId, bookingId);
    return messageRepository.findByBookingId(bookingId);
  },

  getInbox(userId: string) {
    return messageRepository.findInboxForUser(userId);
  },
};
