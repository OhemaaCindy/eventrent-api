import { listingRepository } from "../repositories/listingRepository";
import { ownerRepository } from "../repositories/ownerRepository";
import { AppError } from "../middleware/errorHandler";
import { ListingStatus, VerificationStatus } from "../generated/prisma/client";
import type { CreateListingInput } from "../types/listing";

export const listingService = {
  async createListing(userId: string, input: CreateListingInput) {
    const owner = await ownerRepository.findByUserId(userId);
    if (!owner) {
      throw new AppError(
        403,
        "NOT_AN_OWNER",
        "You need an owner profile before creating listings"
      );
    }

    const category = await listingRepository.findCategoryById(input.categoryId);
    if (!category) {
      throw new AppError(400, "INVALID_CATEGORY", "Category does not exist");
    }

    // ADR-0004: a listing only goes LIVE immediately if the owner is already
    // verified (individuals are APPROVED at profile creation; businesses
    // only reach APPROVED after admin review).
    const status =
      owner.verificationStatus === VerificationStatus.APPROVED
        ? ListingStatus.LIVE
        : ListingStatus.PENDING_REVIEW;

    return listingRepository.create(owner.id, input, status);
  },
};