import { prisma } from "../lib/prisma";
import { reviewRepository } from "../repositories/reviewRepository";
import { listingRepository } from "../repositories/listingRepository";
import { AppError } from "../middleware/errorHandler";
import { DepositHoldStatus } from "../generated/prisma/client";
import type { CreateReviewInput } from "../types/review";

export const reviewService = {
  async createReview(userId: string, bookingId: string, input: CreateReviewInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { depositHold: true },
    });
    if (!booking) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found");
    }

    if (booking.renterId !== userId) {
      throw new AppError(403, "NOT_BOOKING_RENTER", "You are not the renter for this booking");
    }

    const resolvedStatuses: string[] = [DepositHoldStatus.RELEASED, DepositHoldStatus.RETAINED];
    if (!booking.depositHold || !resolvedStatuses.includes(booking.depositHold.status)) {
      throw new AppError(
        409,
        "BOOKING_NOT_COMPLETED",
        "This booking isn't finished yet — reviews are available once the deposit is resolved"
      );
    }

    const existing = await reviewRepository.findByBookingId(bookingId);
    if (existing) {
      throw new AppError(409, "ALREADY_REVIEWED", "You've already reviewed this booking");
    }

    return reviewRepository.create(
      bookingId,
      booking.listingId,
      userId,
      input.rating,
      input.comment
    );
  },

  async getListingReviews(listingId: string) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) {
      throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
    }

    const [reviews, stats] = await Promise.all([
      reviewRepository.findByListingId(listingId),
      reviewRepository.aggregateForListing(listingId),
    ]);

    return { ...stats, reviews };
  },
};
