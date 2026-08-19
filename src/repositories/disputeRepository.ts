import { prisma } from "../lib/prisma";
import { DisputeStatus, DisputeResolution } from "../generated/prisma/client";

export const disputeRepository = {
  create(depositHoldId: string, openedById: string, reason: string, evidenceUrls: string[]) {
    return prisma.dispute.create({
      data: { depositHoldId, openedById, reason, evidenceUrls },
    });
  },

  findById(id: string) {
    return prisma.dispute.findUnique({
      where: { id },
      include: { depositHold: true },
    });
  },

  resolve(id: string, resolution: DisputeResolution, resolvedById: string) {
    return prisma.dispute.update({
      where: { id },
      data: {
        resolution,
        status: DisputeStatus.RESOLVED,
        resolvedById,
        resolvedAt: new Date(),
      },
    });
  },
};