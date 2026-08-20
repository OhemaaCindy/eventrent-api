import { Prisma } from "../generated/prisma/client";
import { BookingStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

type TxClient = Prisma.TransactionClient;

export const bookingRepository = {
  findListingById(tx: TxClient, listingId: string) {
    return tx.listing.findUnique({ where: { id: listingId } });
  },

  async sumOverlappingQuantity(
    tx: TxClient,
    listingId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await tx.booking.aggregate({
      where: {
        listingId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PAYMENT_PENDING] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      _sum: { quantity: true },
    });

    return result._sum.quantity ?? 0;
  },

  create(
    tx: TxClient,
    data: {
      renterId: string;
      listingId: string;
      orderId?: string;
      quantity: number;
      startDate: Date;
      endDate: Date;
      totalPrice: number;
    }
  ) {
    return tx.booking.create({
      data: { ...data, status: BookingStatus.PAYMENT_PENDING },
    });
  },

  findByRenterId(renterId: string) {
    return prisma.booking.findMany({
      where: { renterId },
      include: {
        listing: { include: { images: true } },
        payment: true,
        depositHold: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  countByListingId(listingId: string) {
    return prisma.booking.count({ where: { listingId } });
  },
};