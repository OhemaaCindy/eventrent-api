import { prisma } from "../lib/prisma";
import { ownerRepository } from "../repositories/ownerRepository";
import { AppError } from "../middleware/errorHandler";
import { VerificationStatus, ListingStatus, OwnerType } from "../generated/prisma/client";

export const adminService = {
  async approveOwner(ownerId: string) {
    const owner = await ownerRepository.findById(ownerId);
    if (!owner) {
      throw new AppError(404, "OWNER_NOT_FOUND", "Owner profile not found");
    }
    if (owner.type !== OwnerType.BUSINESS) {
      throw new AppError(400, "NOT_A_BUSINESS", "Only business owners require approval");
    }
    if (owner.verificationStatus === VerificationStatus.APPROVED) {
      throw new AppError(409, "ALREADY_APPROVED", "This owner is already approved");
    }

    return prisma.$transaction(async (tx) => {
      const updatedOwner = await tx.ownerProfile.update({
        where: { id: ownerId },
        data: { verificationStatus: VerificationStatus.APPROVED },
      });

      // Publish any listings this owner created while still pending review.
      await tx.listing.updateMany({
        where: { ownerId, status: ListingStatus.PENDING_REVIEW },
        data: { status: ListingStatus.LIVE },
      });

      return updatedOwner;
    });
  },
};