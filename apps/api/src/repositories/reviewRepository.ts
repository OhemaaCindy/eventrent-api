import { prisma } from "../lib/prisma";

export const reviewRepository = {
  findByBookingId(bookingId: string) {
    return prisma.review.findUnique({ where: { bookingId } });
  },

  create(
    bookingId: string,
    listingId: string,
    reviewerId: string,
    rating: number,
    comment: string | undefined
  ) {
    return prisma.review.create({
      data: { bookingId, listingId, reviewerId, rating, comment },
    });
  },

  findByListingId(listingId: string) {
    return prisma.review.findMany({
      where: { listingId },
      include: { reviewer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async aggregateForListing(listingId: string) {
    const result = await prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      averageRating: result._avg.rating,
      count: result._count,
    };
  },
};
