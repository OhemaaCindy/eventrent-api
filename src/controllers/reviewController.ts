import { Response, NextFunction, Request } from "express";
import { reviewService } from "../services/reviewService";
import { createReviewSchema } from "../types/review";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const reviewController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createReviewSchema.parse(req.body);
      const userId = req.userId as string;
      const bookingId = req.params.id as string;

      const review = await reviewService.createReview(userId, bookingId, input);
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  },

  async listForListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id as string;
      const result = await reviewService.getListingReviews(listingId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
