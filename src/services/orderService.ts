import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { bookingRepository } from "../repositories/bookingRepository";
import { orderRepository } from "../repositories/orderRepository";
import { depositHoldRepository } from "../repositories/depositHoldRepository";
import { AppError } from "../middleware/errorHandler";
import { ListingStatus, Prisma } from "../generated/prisma/client";
import type { CreateOrderInput, CreateRecurringOrderInput } from "../types/order";
import { initializeTransaction } from "../lib/paystack";
import { env } from "../lib/env";
import { daysBetweenInclusive, isSerializationConflict } from "./bookingService";

interface CreatedBooking {
  id: string;
  totalPrice: unknown;
  depositAmount: number;
}

// UTC-safe date arithmetic — booking dates are date-only ISO strings, always
// parsed as UTC midnight, so shifting with the UTC accessors avoids drift
// from the server's local timezone (e.g. a shift landing on the wrong
// calendar day near a DST or month boundary).
function shiftDate(date: Date, frequency: "WEEKLY" | "MONTHLY", occurrenceIndex: number): string {
  const shifted = new Date(date);

  if (frequency === "WEEKLY") {
    shifted.setUTCDate(shifted.getUTCDate() + 7 * occurrenceIndex);
    return shifted.toISOString().slice(0, 10);
  }

  // Monthly anchors on the same day-of-month when possible, clamped to the
  // last day of the target month otherwise (e.g. the 31st in a 30-day
  // month) — the same convention billing systems like Stripe use. Reset to
  // day 1 before changing the month so the shift itself can't overflow.
  const originalDay = date.getUTCDate();
  shifted.setUTCDate(1);
  shifted.setUTCMonth(shifted.getUTCMonth() + occurrenceIndex);
  const daysInTargetMonth = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0)
  ).getUTCDate();
  shifted.setUTCDate(Math.min(originalDay, daysInTargetMonth));

  return shifted.toISOString().slice(0, 10);
}

function generateRecurringItems(input: CreateRecurringOrderInput): CreateOrderInput["items"] {
  const baseStart = new Date(input.startDate);
  const baseEnd = new Date(input.endDate);

  return Array.from({ length: input.occurrences }, (_, i) => ({
    listingId: input.listingId,
    quantity: input.quantity,
    startDate: shiftDate(baseStart, input.frequency, i),
    endDate: shiftDate(baseEnd, input.frequency, i),
  }));
}

export const orderService = {
  async createOrder(renterId: string, input: CreateOrderInput, renterEmail: string) {
    const orderId = crypto.randomUUID();
    const reference = `order_${orderId}`;

    let created: CreatedBooking[];
    let rentalTotal = 0;
    let depositTotal = 0;

    try {
      created = await prisma.$transaction(
        async (tx) => {
          // Create the Order row first (placeholder total) so Booking rows
          // can reference it — Booking.orderId has a foreign key to Order.id.
          await orderRepository.create(tx, orderId, renterId, reference, 0);

          const result: CreatedBooking[] = [];

          for (const item of input.items) {
            const listing = await bookingRepository.findListingById(tx, item.listingId);

            if (!listing) {
              throw new AppError(404, "LISTING_NOT_FOUND", `Listing ${item.listingId} not found`);
            }
            if (listing.status !== ListingStatus.LIVE) {
              throw new AppError(
                400,
                "LISTING_NOT_AVAILABLE",
                `Listing "${listing.title}" is not currently bookable`
              );
            }

            const startDate = new Date(item.startDate);
            const endDate = new Date(item.endDate);

            const alreadyBooked = await bookingRepository.sumOverlappingQuantity(
              tx,
              item.listingId,
              startDate,
              endDate
            );
            const available = listing.quantityTotal - alreadyBooked;

            if (item.quantity > available) {
              throw new AppError(
                409,
                "INSUFFICIENT_STOCK",
                `Only ${available} unit(s) of "${listing.title}" available for these dates`
              );
            }

            const days = daysBetweenInclusive(startDate, endDate);
            const totalPrice = Number(listing.pricePerDay) * item.quantity * days;
            const depositAmount = Number(listing.depositAmount);

            const booking = await bookingRepository.create(tx, {
              renterId,
              listingId: item.listingId,
              orderId,
              quantity: item.quantity,
              startDate,
              endDate,
              totalPrice,
            });

            rentalTotal += totalPrice;
            depositTotal += depositAmount;
            result.push({ id: booking.id, totalPrice: booking.totalPrice, depositAmount });
          }

          await tx.order.update({
            where: { id: orderId },
            data: { totalAmount: rentalTotal },
          });

          return result;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (err) {
      if (isSerializationConflict(err)) {
        throw new AppError(
          409,
          "BOOKING_CONFLICT",
          "This checkout couldn't be completed due to a conflicting request — please try again"
        );
      }
      throw err;
    }

    // Payment initialization happens OUTSIDE the transaction — never hold a
    // DB transaction open across a network call to an external service.
    const totalCharge = rentalTotal + depositTotal;
    const paystackResponse = await initializeTransaction(
      renterEmail,
      totalCharge,
      reference,
      `${env.FRONTEND_URL}/orders/${orderId}/payment-callback`
    );

    // Every booking in the order shares one Paystack transaction reference —
    // each owner's deposit is later refunded as a partial refund of this
    // same shared charge, not a separate transaction.
    await Promise.all(
      created.map((booking) =>
        depositHoldRepository.create(booking.id, reference, booking.depositAmount)
      )
    );

    return { orderId, bookings: created, paymentUrl: paystackResponse.authorization_url };
  },

  async createRecurringOrder(
    renterId: string,
    input: CreateRecurringOrderInput,
    renterEmail: string
  ) {
    const items = generateRecurringItems(input);
    return orderService.createOrder(renterId, { items }, renterEmail);
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
    }

    if (order.renterId !== userId) {
      throw new AppError(403, "NOT_ORDER_OWNER", "This order does not belong to you");
    }

    return order;
  },
};
