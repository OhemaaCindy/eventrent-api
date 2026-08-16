import { prisma } from "../lib/prisma";
import { OwnerType, VerificationStatus } from "../generated/prisma/client";

export const ownerRepository = {
  findByUserId(userId: string) {
    return prisma.ownerProfile.findUnique({ where: { userId } });
  },

  create(userId: string, type: OwnerType, businessName: string | undefined, verificationStatus: VerificationStatus) {
    return prisma.ownerProfile.create({
      data: { userId, type, businessName, verificationStatus },
    });
  },
};