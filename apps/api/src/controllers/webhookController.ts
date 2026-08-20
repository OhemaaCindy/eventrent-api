import crypto from "crypto";
import { Request, Response } from "express";
import { env } from "../lib/env";
import { verifyTransaction } from "../lib/paystack";
import { paymentRepository } from "../repositories/paymentRepository";
import { orderRepository } from "../repositories/orderRepository";
import { prisma } from "../lib/prisma";
import { BookingStatus, PaymentStatus } from "../generated/prisma/client";

function splitCommission(totalPrice: unknown) {
  const totalPriceCents = Math.round(Number(totalPrice) * 100);
  const commissionCents = Math.round(totalPriceCents * (env.PLATFORM_COMMISSION_PERCENT / 100));
  return {
    payoutAmount: (totalPriceCents - commissionCents) / 100,
    commissionAmount: commissionCents / 100,
  };
}

export const webhookController = {
  async handlePaystackWebhook(req: Request, res: Response) {
    const signature = req.headers["x-paystack-signature"];
    const rawBody = req.body as Buffer;

    if (typeof signature !== "string") {
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    const signatureValid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

    if (!signatureValid) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    // Always respond 200 quickly once the signature is valid, even if we
    // don't act on this particular event type — Paystack retries on non-200
    // responses, and there's no reason to retry an event we intentionally ignore.
    res.status(200).json({ received: true });

    const event = JSON.parse(rawBody.toString("utf-8"));

    if (event.event !== "charge.success") {
      return;
    }

    const reference = event.data.reference as string;

    // Bundled multi-item checkouts share one Paystack reference across
    // several bookings (see orderService.ts) — handle that shape first,
    // and fall through to the single-booking path below otherwise.
    const order = await orderRepository.findByReference(reference);
    if (order) {
      if (order.status === PaymentStatus.PAID) {
        return;
      }

      const verified = await verifyTransaction(reference);
      if (verified.status !== "success") {
        return;
      }

      // A renter can cancel one booking within a multi-item order while the
      // others are still in flight — don't resurrect a cancelled booking
      // just because the shared order payment eventually confirms.
      const orderBookings = (
        await prisma.booking.findMany({
          where: { orderId: order.id },
          include: { listing: true },
        })
      ).filter((booking) => booking.status !== BookingStatus.CANCELLED);

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: PaymentStatus.PAID },
        }),
        ...orderBookings.map((booking) =>
          prisma.booking.update({
            where: { id: booking.id },
            data: { status: BookingStatus.CONFIRMED },
          })
        ),
        ...orderBookings.map((booking) => {
          const { payoutAmount, commissionAmount } = splitCommission(booking.totalPrice);
          return prisma.payout.create({
            data: {
              bookingId: booking.id,
              ownerId: booking.listing.ownerId,
              amount: payoutAmount,
              commissionAmount,
            },
          });
        }),
      ]);
      return;
    }

    const payment = await paymentRepository.findByReference(reference);

    if (!payment || payment.status === PaymentStatus.PAID) {
      // Unknown reference, or already processed — idempotency guard against
      // Paystack's documented at-least-once delivery (same event can arrive more than once).
      return;
    }

    // Defense in depth: re-verify directly with Paystack rather than trusting
    // the webhook payload's fields alone.
    const verified = await verifyTransaction(reference);
    if (verified.status !== "success") {
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { listing: true },
    });
    // Don't resurrect a booking the renter already cancelled while this
    // payment was still in flight.
    if (!booking || booking.status === BookingStatus.CANCELLED) {
      return;
    }

    const { payoutAmount, commissionAmount } = splitCommission(booking.totalPrice);

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED },
      }),
      prisma.payout.create({
        data: {
          bookingId: booking.id,
          ownerId: booking.listing.ownerId,
          amount: payoutAmount,
          commissionAmount,
        },
      }),
    ]);
  },
};