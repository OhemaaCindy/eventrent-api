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

  findById(id: string) {
  return prisma.ownerProfile.findUnique({ where: { id } });
},

updateVerificationStatus(id: string, status: VerificationStatus) {
  return prisma.ownerProfile.update({
    where: { id },
    data: { verificationStatus: status },
  });
},

addVerificationDocuments(id: string, urls: string[]) {
  return prisma.ownerProfile.update({
    where: { id },
    data: { verificationDocumentUrls: { push: urls } },
  });
},

findPendingBusinessOwners() {
  return prisma.ownerProfile.findMany({
    where: { type: OwnerType.BUSINESS, verificationStatus: VerificationStatus.PENDING },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
},
};

