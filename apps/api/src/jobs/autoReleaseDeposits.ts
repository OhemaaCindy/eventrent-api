import cron from "node-cron";
import { depositHoldRepository } from "../repositories/depositHoldRepository";
import { refundTransaction } from "../lib/paystack";
import { DepositHoldStatus } from "../generated/prisma/client";

async function runAutoRelease() {
  const dueDeposits = await depositHoldRepository.findDueForAutoRelease();

  if (dueDeposits.length === 0) {
    return;
  }

  console.log(`[auto-release] Processing ${dueDeposits.length} deposit(s) past their release window`);

  for (const deposit of dueDeposits) {
    try {
      if (!deposit.providerReference) {
        console.error(`[auto-release] Deposit ${deposit.id} has no provider reference, skipping`);
        continue;
      }

      const refund = await refundTransaction(deposit.providerReference, Number(deposit.amount));

      await depositHoldRepository.updateStatus(
        deposit.id,
        DepositHoldStatus.RELEASED,
        refund.transaction.reference
      );

      console.log(`[auto-release] Released deposit ${deposit.id}`);
    } catch (err) {
      // One failed refund should never stop the rest of the batch from processing.
      console.error(`[auto-release] Failed to release deposit ${deposit.id}:`, err);
    }
  }
}

export function startAutoReleaseJob() {
  // Runs every hour, on the hour. Checking hourly (rather than e.g. every
  // minute) is deliberately conservative — this isn't a time-critical path,
  // and refunds happening up to ~an hour later than the exact 48h mark is fine.
  cron.schedule("0 * * * *", runAutoRelease);
  console.log("[auto-release] Scheduled job started (runs hourly)");
}