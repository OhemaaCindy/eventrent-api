import { prisma } from "../lib/prisma";

export const messageRepository = {
  create(bookingId: string, senderId: string, body: string) {
    return prisma.message.create({
      data: { bookingId, senderId, body },
    });
  },

  findByBookingId(bookingId: string) {
    return prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });
  },

  async findInboxForUser(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ renterId: userId }, { listing: { owner: { userId } } }],
      },
      include: {
        listing: { include: { images: true, owner: true } },
        renter: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return bookings
      .filter((booking) => booking.messages.length > 0)
      .sort(
        (a, b) =>
          (b.messages[0]?.createdAt.getTime() ?? 0) -
          (a.messages[0]?.createdAt.getTime() ?? 0)
      );
  },
};
