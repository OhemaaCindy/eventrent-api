import { prisma } from "../lib/prisma";
import { PayoutStatus } from "../generated/prisma/client";

export const payoutRepository = {
  create(bookingId: string, ownerId: string, amount: number, commissionAmount: number) {
    return prisma.payout.create({
      data: { bookingId, ownerId, amount, commissionAmount },
    });
  },

  findById(id: string) {
    return prisma.payout.findUnique({ where: { id } });
  },

  findAll() {
    return prisma.payout.findMany({
      include: {
        booking: { include: { listing: true } },
        owner: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  markPaid(id: string) {
    return prisma.payout.update({
      where: { id },
      data: { status: PayoutStatus.PAID, paidAt: new Date() },
    });
  },
};
