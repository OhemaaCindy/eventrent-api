import { prisma } from "../lib/prisma";
import { DepositHoldStatus } from "../generated/prisma/client";

const AUTO_RELEASE_HOURS = 48;

export const depositHoldRepository = {
  create(bookingId: string, providerReference: string, amount: unknown) {
    const autoReleaseAt = new Date(Date.now() + AUTO_RELEASE_HOURS * 60 * 60 * 1000);
    return prisma.depositHold.create({
      data: {
        bookingId,
        providerReference,
        amount: amount as never,
        autoReleaseAt,
      },
    });
  },

  findByBookingId(bookingId: string) {
    return prisma.depositHold.findUnique({ where: { bookingId } });
  },

  updateStatus(id: string, status: DepositHoldStatus, refundReference?: string) {
    return prisma.depositHold.update({
      where: { id },
      data: { status, ...(refundReference ? { refundReference } : {}) },
    });
  },

  findDueForAutoRelease() {
    return prisma.depositHold.findMany({
      where: { status: DepositHoldStatus.HELD, autoReleaseAt: { lte: new Date() } },
    });
  },

  markRenterConfirmed(id: string) {
    // Re-anchor the auto-release window to the actual return moment —
    // the original autoReleaseAt (set at booking creation) is just an
    // estimate and can be wildly off from when the item really comes back.
    const autoReleaseAt = new Date(Date.now() + AUTO_RELEASE_HOURS * 60 * 60 * 1000);
    return prisma.depositHold.update({
      where: { id },
      data: { renterConfirmedReturnAt: new Date(), autoReleaseAt },
    });
  },
};