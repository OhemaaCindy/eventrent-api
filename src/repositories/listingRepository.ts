import { prisma } from "../lib/prisma";
import { FulfillmentType, ListingStatus } from "../generated/prisma/client";

export const listingRepository = {
  findCategoryById(categoryId: string) {
    return prisma.category.findUnique({ where: { id: categoryId } });
  },

  create(
    ownerId: string,
    input: {
      categoryId: string;
      title: string;
      quantityTotal: number;
      pricePerDay: number;
      depositAmount: number;
      fulfillmentType: FulfillmentType;
    },
    status: ListingStatus
  ) {
    return prisma.listing.create({
      data: { ownerId, ...input, status },
    });
  },
};