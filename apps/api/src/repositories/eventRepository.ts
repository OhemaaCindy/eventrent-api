import { prisma } from "../lib/prisma";

const bookingsInclude = {
  bookings: { include: { listing: { include: { images: true } } } },
} as const;

export const eventRepository = {
  create(renterId: string, name: string, eventDate: Date) {
    return prisma.event.create({ data: { renterId, name, eventDate } });
  },

  findByRenterId(renterId: string) {
    return prisma.event.findMany({
      where: { renterId },
      include: bookingsInclude,
      orderBy: { eventDate: "asc" },
    });
  },

  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: bookingsInclude,
    });
  },

  delete(id: string) {
    return prisma.event.delete({ where: { id } });
  },

  attachBooking(eventId: string, bookingId: string) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { eventId },
    });
  },

  detachBooking(bookingId: string) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { eventId: null },
    });
  },
};
