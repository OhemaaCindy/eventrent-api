import { prisma } from "../lib/prisma";
import { bookingRepository } from "../repositories/bookingRepository";
import { paymentRepository } from "../repositories/paymentRepository";
import { AppError } from "../middleware/errorHandler";
import {
  BookingStatus,
  CancellationPolicy,
  DepositHoldStatus,
  ListingStatus,
  PaymentStatus,
  Prisma,
  PayoutStatus,
} from "../generated/prisma/client";
import type { CreateBookingInput } from "../types/booking";
import { initializeTransaction, refundTransaction } from "../lib/paystack";
import { env } from "../lib/env";
import { depositHoldRepository } from "../repositories/depositHoldRepository";

const CANCELLATION_WINDOW_HOURS: Record<CancellationPolicy, number> = {
  FLEXIBLE: 24,
  MODERATE: 72,
  STRICT: 168,
};

export function daysBetweenInclusive(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
}

export function isSerializationConflict(err: unknown): boolean {
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

    let txResult: { booking: { id: string; totalPrice: unknown }; depositAmount: number };
    try {
      txResult = await prisma.$transaction(
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

          const newBooking = await bookingRepository.create(tx, {
            renterId,
            listingId: input.listingId,
            quantity: input.quantity,
            startDate,
            endDate,
            totalPrice,
          });

          return { booking: newBooking, depositAmount: Number(listing.depositAmount) };
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

    const { booking, depositAmount } = txResult;

    // Payment initialization happens OUTSIDE the transaction — never hold a
    // DB transaction open across a network call to an external service.
    const reference = `booking_${booking.id}`;
    const totalCharge = Number(booking.totalPrice) + depositAmount;

    const paystackResponse = await initializeTransaction(
      renterEmail,
      totalCharge,
      reference,
      `${env.FRONTEND_URL}/bookings/${booking.id}/payment-callback`
    );

    await paymentRepository.create(booking.id, reference, booking.totalPrice);
    await depositHoldRepository.create(booking.id, reference, depositAmount);

    return { booking, paymentUrl: paystackResponse.authorization_url };
  },

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, payment: true, depositHold: true, order: true, payout: true },
    });
    if (!booking) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found");
    }

    if (booking.renterId !== userId) {
      throw new AppError(403, "NOT_BOOKING_RENTER", "You are not the renter for this booking");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError(409, "ALREADY_CANCELLED", "This booking is already cancelled");
    }

    if (new Date() >= booking.startDate) {
      throw new AppError(
        409,
        "BOOKING_ALREADY_STARTED",
        "This booking has already started and can no longer be cancelled"
      );
    }

    // Whether money was actually captured (and its shared Paystack reference)
    // depends on whether this booking is part of a bundled order or stands
    // alone — see orderService.ts for why order-based bookings have no
    // individual Payment row.
    const paymentConfirmed = booking.orderId
      ? booking.order?.status === PaymentStatus.PAID
      : booking.payment?.status === PaymentStatus.PAID;
    const sharedReference = booking.orderId
      ? booking.order?.providerReference
      : booking.payment?.providerReference;

    const windowHours = CANCELLATION_WINDOW_HOURS[booking.listing.cancellationPolicy];
    const hoursUntilStart = (booking.startDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const rentalFeeRefundEligible = hoursUntilStart >= windowHours;

    // The deposit is always released on cancellation — it protects against
    // damage during a rental that, here, never happened. Only the rental
    // fee is subject to the cancellation policy window. Note this release
    // amount is just DB bookkeeping (clearing a HELD deposit that no longer
    // makes sense to hold) — whether it corresponds to an actual Paystack
    // refund depends on whether payment was ever confirmed in the first place.
    const depositToRelease =
      booking.depositHold?.status === DepositHoldStatus.HELD
        ? Number(booking.depositHold.amount)
        : 0;
    const rentalFeeToRefund = rentalFeeRefundEligible ? Number(booking.totalPrice) : 0;

    // Nothing was ever actually charged if payment never confirmed — so
    // there's nothing to refund via Paystack, regardless of policy/deposit.
    const actualRefundAmount = paymentConfirmed ? depositToRelease + rentalFeeToRefund : 0;

    let refundReference: string | undefined;
    if (actualRefundAmount > 0 && sharedReference) {
      const refund = await refundTransaction(sharedReference, actualRefundAmount);
      refundReference = refund.transaction.reference;
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      }),
      ...(booking.depositHold && depositToRelease > 0
        ? [
            prisma.depositHold.update({
              where: { id: booking.depositHold.id },
              data: { status: DepositHoldStatus.RELEASED, refundReference },
            }),
          ]
        : []),
      ...(paymentConfirmed && !booking.orderId && booking.payment && rentalFeeToRefund > 0
        ? [
            prisma.payment.update({
              where: { id: booking.payment.id },
              data: { status: PaymentStatus.REFUNDED },
            }),
          ]
        : []),
      // The owner shouldn't be paid out for a cancelled rental — but if the
      // payout was already marked PAID (real money already sent), that's a
      // manual admin matter, not something to silently reverse here.
      ...(booking.payout && booking.payout.status === PayoutStatus.PENDING
        ? [prisma.payout.delete({ where: { id: booking.payout.id } })]
        : []),
    ]);

    return {
      bookingId: booking.id,
      status: BookingStatus.CANCELLED,
      rentalFeeRefunded: paymentConfirmed ? rentalFeeToRefund : 0,
      depositRefunded: paymentConfirmed ? depositToRelease : 0,
    };
  },
};