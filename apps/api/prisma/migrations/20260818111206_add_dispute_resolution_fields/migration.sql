/*
  Warnings:

  - The values [REFUNDED] on the enum `DepositHoldStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DisputeResolution" AS ENUM ('REFUND_RENTER', 'RETAIN_DEPOSIT');

-- AlterEnum
BEGIN;
CREATE TYPE "DepositHoldStatus_new" AS ENUM ('HELD', 'RELEASED', 'DISPUTED', 'RETAINED');
ALTER TABLE "public"."DepositHold" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DepositHold" ALTER COLUMN "status" TYPE "DepositHoldStatus_new" USING ("status"::text::"DepositHoldStatus_new");
ALTER TYPE "DepositHoldStatus" RENAME TO "DepositHoldStatus_old";
ALTER TYPE "DepositHoldStatus_new" RENAME TO "DepositHoldStatus";
DROP TYPE "public"."DepositHoldStatus_old";
ALTER TABLE "DepositHold" ALTER COLUMN "status" SET DEFAULT 'HELD';
COMMIT;

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "resolution" "DisputeResolution",
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedById" TEXT;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
