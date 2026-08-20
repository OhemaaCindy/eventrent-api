import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

type TxClient = Prisma.TransactionClient;

export const orderRepository = {
  create(
    tx: TxClient,
    id: string,
    renterId: string,
    providerReference: string,
    totalAmount: number
  ) {
    return tx.order.create({
      data: { id, renterId, providerReference, totalAmount },
    });
  },

  findByReference(providerReference: string) {
    return prisma.order.findUnique({ where: { providerReference } });
  },

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        bookings: { include: { listing: { include: { images: true } } } },
      },
    });
  },
};
