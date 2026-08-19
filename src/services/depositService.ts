import { depositHoldRepository } from "../repositories/depositHoldRepository";
import { disputeRepository } from "../repositories/disputeRepository";
import { ownerRepository } from "../repositories/ownerRepository";
import { refundTransaction } from "../lib/paystack";
import { uploadImageBuffer } from "../lib/cloudinary";
import { AppError } from "../middleware/errorHandler";
import { DepositHoldStatus, DisputeResolution, DisputeStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

async function getAuthorizedBookingDeposit(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });
  if (!booking) {
    throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found");
  }

  const owner = await ownerRepository.findByUserId(userId);
  if (!owner || owner.id !== booking.listing.ownerId) {
    throw new AppError(403, "NOT_BOOKING_OWNER", "You do not own the listing for this booking");
  }

  const depositHold = await depositHoldRepository.findByBookingId(bookingId);
  if (!depositHold) {
    throw new AppError(404, "DEPOSIT_NOT_FOUND", "No deposit hold found for this booking");
  }
  if (depositHold.status !== DepositHoldStatus.HELD) {
    throw new AppError(
      409,
      "DEPOSIT_NOT_HELD",
      `Deposit is already ${depositHold.status.toLowerCase()}`
    );
  }

  return depositHold;
}

export const depositService = {
  async confirmReturn(userId: string, bookingId: string) {
    const depositHold = await getAuthorizedBookingDeposit(userId, bookingId);

    if (!depositHold.providerReference) {
      throw new AppError(500, "MISSING_REFERENCE", "Deposit has no payment reference to refund");
    }

    const refund = await refundTransaction(
      depositHold.providerReference,
      Number(depositHold.amount)
    );

    return depositHoldRepository.updateStatus(
      depositHold.id,
      DepositHoldStatus.RELEASED,
      refund.transaction.reference
    );
  },

  async openDispute(userId: string, bookingId: string, reason: string, evidenceFiles: Express.Multer.File[]) {
    if (evidenceFiles.length === 0) {
      throw new AppError(400, "EVIDENCE_REQUIRED", "At least one evidence photo is required to open a dispute");
    }

    const depositHold = await getAuthorizedBookingDeposit(userId, bookingId);

    let evidenceUrls: string[];
    try {
      evidenceUrls = await Promise.all(
        evidenceFiles.map((file) => uploadImageBuffer(file.buffer, "eventrent/disputes"))
      );
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      throw new AppError(502, "IMAGE_UPLOAD_FAILED", "Failed to upload evidence photos");
    }

    await depositHoldRepository.updateStatus(depositHold.id, DepositHoldStatus.DISPUTED);
    return disputeRepository.create(depositHold.id, userId, reason, evidenceUrls);
  },

  async resolveDispute(disputeId: string, resolution: DisputeResolution, adminUserId: string) {
    const dispute = await disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new AppError(404, "DISPUTE_NOT_FOUND", "Dispute not found");
    }
    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new AppError(409, "ALREADY_RESOLVED", "This dispute has already been resolved");
    }

    if (resolution === DisputeResolution.REFUND_RENTER) {
      if (!dispute.depositHold.providerReference) {
        throw new AppError(500, "MISSING_REFERENCE", "Deposit has no payment reference to refund");
      }
      const refund = await refundTransaction(
        dispute.depositHold.providerReference,
        Number(dispute.depositHold.amount)
      );
      await depositHoldRepository.updateStatus(
        dispute.depositHoldId,
        DepositHoldStatus.RELEASED,
        refund.transaction.reference
      );
    } else {
      await depositHoldRepository.updateStatus(dispute.depositHoldId, DepositHoldStatus.RETAINED);
    }

    return disputeRepository.resolve(disputeId, resolution, adminUserId);
  },
};