import { prisma } from "../lib/prisma";
import { ownerRepository } from "../repositories/ownerRepository";
import { payoutRepository } from "../repositories/payoutRepository";
import { AppError } from "../middleware/errorHandler";
import { VerificationStatus, ListingStatus, OwnerType, PayoutStatus } from "../generated/prisma/client";

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

  async rejectOwner(ownerId: string) {
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
    if (owner.verificationStatus === VerificationStatus.REJECTED) {
      throw new AppError(409, "ALREADY_REJECTED", "This owner is already rejected");
    }

    return ownerRepository.updateVerificationStatus(ownerId, VerificationStatus.REJECTED);
  },

  listPendingVerifications() {
    return ownerRepository.findPendingBusinessOwners();
  },

  listPayouts() {
    return payoutRepository.findAll();
  },

  async markPayoutPaid(payoutId: string) {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(404, "PAYOUT_NOT_FOUND", "Payout not found");
    }
    if (payout.status === PayoutStatus.PAID) {
      throw new AppError(409, "ALREADY_PAID", "This payout has already been marked as paid");
    }

    return payoutRepository.markPaid(payoutId);
  },
};