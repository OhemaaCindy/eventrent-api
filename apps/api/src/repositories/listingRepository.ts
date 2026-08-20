import { prisma } from "../lib/prisma";
import { CancellationPolicy, FulfillmentType, ListingStatus } from "../generated/prisma/client";

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
      cancellationPolicy?: CancellationPolicy;
    },
    status: ListingStatus
  ) {
    return prisma.listing.create({
      data: { ownerId, ...input, status },
    });
  },

  findMany(filters: { categoryId?: string; location?: string } = {}) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.LIVE,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.location && {
        location: { contains: filters.location, mode: "insensitive" },
      }),
    },
    include: { category: true, images: true, pricingTiers: true },
    orderBy: { createdAt: "desc" },
  });
},

findByOwnerId(ownerId: string) {
  return prisma.listing.findMany({
    where: { ownerId },
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

update(id: string, data: Partial<{
  categoryId: string;
  title: string;
  location: string;
  quantityTotal: number;
  pricePerDay: number;
  depositAmount: number;
  fulfillmentType: FulfillmentType;
  cancellationPolicy: CancellationPolicy;
  status: ListingStatus;
}>) {
  return prisma.listing.update({ where: { id }, data });
},

remove(id: string) {
  return prisma.$transaction([
    prisma.listingImage.deleteMany({ where: { listingId: id } }),
    prisma.pricingTier.deleteMany({ where: { listingId: id } }),
    prisma.listing.delete({ where: { id } }),
  ]);
},
};

