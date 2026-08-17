/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `providerReference` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DepositHold" ADD COLUMN     "providerReference" TEXT,
ADD COLUMN     "refundReference" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "providerReference" TEXT NOT NULL;
