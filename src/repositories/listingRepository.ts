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
      location: string;
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

  findMany() {
  return prisma.listing.findMany({
    where: { status: ListingStatus.LIVE },
    include: { category: true, images: true, pricingTiers: true },
    orderBy: { createdAt: "desc" },
  });
},

findById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { category: true, images: true, pricingTiers: true, owner: true },
  });
},
};

