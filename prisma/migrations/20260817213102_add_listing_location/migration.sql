-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'Unknown';

-- Backfill existing rows, then drop the default so future inserts must
-- provide a real location explicitly.
ALTER TABLE "Listing" ALTER COLUMN "location" DROP DEFAULT;
