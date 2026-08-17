import { prisma } from "../lib/prisma";

export const paymentRepository = {
  create(bookingId: string, providerReference: string, amount: unknown) {
    return prisma.payment.create({
      data: { bookingId, providerReference, amount: amount as never },
    });
  },

  findByReference(providerReference: string) {
    return prisma.payment.findFirst({ where: { providerReference } });
  },
};
