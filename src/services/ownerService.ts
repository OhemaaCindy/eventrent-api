import { ownerRepository } from "../repositories/ownerRepository";
import { AppError } from "../middleware/errorHandler";
import { OwnerType, VerificationStatus } from "../generated/prisma/client";
import type { CreateOwnerProfileInput } from "../types/owner";

export const ownerService = {
  async createOwnerProfile(userId: string, input: CreateOwnerProfileInput) {
    const existing = await ownerRepository.findByUserId(userId);
    if (existing) {
      throw new AppError(409, "OWNER_PROFILE_EXISTS", "You already have an owner profile");
    }

    const type = input.type === "BUSINESS" ? OwnerType.BUSINESS : OwnerType.INDIVIDUAL;

    // This is the actual ADR-0004 rule: businesses start pending, individuals go live immediately
    const verificationStatus =
      type === OwnerType.BUSINESS ? VerificationStatus.PENDING : VerificationStatus.APPROVED;

    return ownerRepository.create(userId, type, input.businessName, verificationStatus);
  },
};