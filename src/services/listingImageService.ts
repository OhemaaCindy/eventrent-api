import { prisma } from "../lib/prisma";
import { listingImageRepository } from "../repositories/listingImageRepository";
import { ownerRepository } from "../repositories/ownerRepository";
import { uploadImageBuffer } from "../lib/cloudinary";
import { AppError } from "../middleware/errorHandler";

export const listingImageService = {
  async addImage(userId: string, listingId: string, fileBuffer: Buffer) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
    }

    const owner = await ownerRepository.findByUserId(userId);
    if (!owner || owner.id !== listing.ownerId) {
      throw new AppError(
        403,
        "NOT_LISTING_OWNER",
        "You do not own this listing",
      );
    }

    let url: string;
    try {
      url = await uploadImageBuffer(fileBuffer, "eventrent/listings");
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      throw new AppError(502, "IMAGE_UPLOAD_FAILED", "Failed to upload image");
    }

    const existingCount =
      await listingImageRepository.countByListingId(listingId);

    return listingImageRepository.create(listingId, url, existingCount);
  },
};
