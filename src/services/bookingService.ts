import { prisma } from "../lib/prisma";
import { bookingRepository } from "../repositories/bookingRepository";

import { AppError } from "../middleware/errorHandler";
import { ListingStatus, Prisma } from "../generated/prisma/client";
import type { CreateBookingInput } from "../types/booking";
import { initializeTransaction } from "../lib/paystack";
import { env } from "../lib/env";
import { paymentRepository } from "../repositories/paymentRepository";

function daysBetweenInclusive(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
}

function isSerializationConflict(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("cause" in err)) {
    return false;
  }
  const cause = (err as { cause?: { originalCode?: string; kind?: string } }).cause;
  return cause?.originalCode === "40001" || cause?.kind === "TransactionWriteConflict";
}

export const bookingService = {
  async createBooking(renterId: string, input: CreateBookingInput, renterEmail: string) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    let booking;
    try {
      booking = await prisma.$transaction(
        async (tx) => {
          const listing = await bookingRepository.findListingById(tx, input.listingId);

          if (!listing) {
            throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
          }
          if (listing.status !== ListingStatus.LIVE) {
            throw new AppError(400, "LISTING_NOT_AVAILABLE", "This listing is not currently bookable");
          }

          const alreadyBooked = await bookingRepository.sumOverlappingQuantity(
            tx,
            input.listingId,
            startDate,
            endDate
          );
          const available = listing.quantityTotal - alreadyBooked;

          if (input.quantity > available) {
            throw new AppError(
              409,
              "INSUFFICIENT_STOCK",
              `Only ${available} unit(s) available for these dates`
            );
          }

          const days = daysBetweenInclusive(startDate, endDate);
          const totalPrice = Number(listing.pricePerDay) * input.quantity * days;

          return bookingRepository.create(tx, {
            renterId,
            listingId: input.listingId,
            quantity: input.quantity,
            startDate,
            endDate,
            totalPrice,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (err) {
      if (isSerializationConflict(err)) {
        throw new AppError(
          409,
          "BOOKING_CONFLICT",
          "This booking couldn't be completed due to a conflicting request — please try again"
        );
      }
      throw err;
    }

    // Booking row exists, stock is reserved. Payment initialization happens
    // OUTSIDE the transaction — never hold a DB transaction open across a
    // network call to an external service.
    const reference = `booking_${booking.id}`;
    const paystackResponse = await initializeTransaction(
      renterEmail,
      Number(booking.totalPrice),
      reference,
      `${env.FRONTEND_URL}/bookings/${booking.id}/payment-callback`
    );

    await paymentRepository.create(booking.id, reference, booking.totalPrice);

    return { booking, paymentUrl: paystackResponse.authorization_url };
  },
};