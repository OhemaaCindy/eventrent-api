import { listingRepository } from "../repositories/listingRepository";
import { ownerRepository } from "../repositories/ownerRepository";
import { bookingRepository } from "../repositories/bookingRepository";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { ListingStatus, VerificationStatus } from "../generated/prisma/client";
import type { CreateListingInput, UpdateListingInput, BrowseListingsInput } from "../types/listing";

export const listingService = {
  async browseListings(filters: BrowseListingsInput) {
    const listings = await listingRepository.findMany({
      categoryId: filters.categoryId,
      location: filters.location,
    });

    if (!filters.startDate || !filters.endDate) {
      return listings;
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    const overlapping = await Promise.all(
      listings.map((listing) =>
        bookingRepository.sumOverlappingQuantity(prisma, listing.id, startDate, endDate)
      )
    );

    return listings.filter((listing, i) => listing.quantityTotal - (overlapping[i] ?? 0) > 0);
  },

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

  async getMyListings(userId: string) {
    const owner = await ownerRepository.findByUserId(userId);
    if (!owner) {
      throw new AppError(
        403,
        "NOT_AN_OWNER",
        "You need an owner profile before viewing your listings"
      );
    }

    return listingRepository.findByOwnerId(owner.id);
  },

  async updateListing(userId: string, listingId: string, input: UpdateListingInput) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) {
      throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
    }

    if (listing.owner.userId !== userId) {
      throw new AppError(403, "NOT_LISTING_OWNER", "You do not own this listing");
    }

    if (
      input.status &&
      listing.status !== ListingStatus.LIVE &&
      listing.status !== ListingStatus.PAUSED
    ) {
      throw new AppError(
        400,
        "INVALID_STATUS_TRANSITION",
        "This listing cannot be paused or resumed in its current status"
      );
    }

    return listingRepository.update(listingId, input);
  },

  async deleteListing(userId: string, listingId: string) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) {
      throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
    }

    if (listing.owner.userId !== userId) {
      throw new AppError(403, "NOT_LISTING_OWNER", "You do not own this listing");
    }

    const bookingCount = await bookingRepository.countByListingId(listingId);
    if (bookingCount > 0) {
      throw new AppError(
        409,
        "LISTING_HAS_BOOKINGS",
        "This listing has booking history and cannot be deleted — pause it instead"
      );
    }

    await listingRepository.remove(listingId);
  },
};