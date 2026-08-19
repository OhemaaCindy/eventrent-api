import crypto from "crypto";
import { Request, Response } from "express";
import { env } from "../lib/env";
import { verifyTransaction } from "../lib/paystack";
import { paymentRepository } from "../repositories/paymentRepository";
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
    if (!booking) {
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