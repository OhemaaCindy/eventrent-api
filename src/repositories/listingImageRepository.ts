import { prisma } from "../lib/prisma";

export const listingImageRepository = {
  create(listingId: string, url: string, sortOrder: number) {
    return prisma.listingImage.create({
      data: { listingId, url, sortOrder },
    });
  },

  countByListingId(listingId: string) {
    return prisma.listingImage.count({ where: { listingId } });
  },
};