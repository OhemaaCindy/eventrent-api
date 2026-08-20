-- AlterEnum
ALTER TYPE "DepositHoldStatus" ADD VALUE 'SPLIT';

-- AlterEnum
ALTER TYPE "DisputeResolution" ADD VALUE 'SPLIT';

-- AlterTable
ALTER TABLE "OwnerProfile" ADD COLUMN     "verificationDocumentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
