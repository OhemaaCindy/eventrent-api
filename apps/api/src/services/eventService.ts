import { prisma } from "../lib/prisma";
import { eventRepository } from "../repositories/eventRepository";
import { AppError } from "../middleware/errorHandler";
import type { CreateEventInput } from "../types/event";

function withTotalCost<T extends { bookings: { totalPrice: unknown }[] }>(event: T) {
  const totalCost = event.bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
  return { ...event, totalCost };
}

async function assertOwnEvent(userId: string, eventId: string) {
  const event = await eventRepository.findById(eventId);
  if (!event) {
    throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
  }
  if (event.renterId !== userId) {
    throw new AppError(403, "NOT_EVENT_OWNER", "This event does not belong to you");
  }
  return event;
}

export const eventService = {
  async createEvent(userId: string, input: CreateEventInput) {
    return eventRepository.create(userId, input.name, new Date(input.eventDate));
  },

  async listEvents(userId: string) {
    const events = await eventRepository.findByRenterId(userId);
    return events.map(withTotalCost);
  },

  async getEventById(userId: string, eventId: string) {
    const event = await assertOwnEvent(userId, eventId);
    return withTotalCost(event);
  },

  async deleteEvent(userId: string, eventId: string) {
    await assertOwnEvent(userId, eventId);
    await eventRepository.delete(eventId);
  },

  async attachBooking(userId: string, eventId: string, bookingId: string) {
    await assertOwnEvent(userId, eventId);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found");
    }
    if (booking.renterId !== userId) {
      throw new AppError(403, "NOT_BOOKING_RENTER", "You are not the renter for this booking");
    }

    return eventRepository.attachBooking(eventId, bookingId);
  },

  async detachBooking(userId: string, eventId: string, bookingId: string) {
    await assertOwnEvent(userId, eventId);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.eventId !== eventId) {
      throw new AppError(404, "BOOKING_NOT_IN_EVENT", "This booking is not part of this event");
    }

    return eventRepository.detachBooking(bookingId);
  },
};
