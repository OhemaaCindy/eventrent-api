import { Response, NextFunction } from "express";
import { listingService } from "../services/listingService";
import { createListingSchema } from "../types/listing";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const listingController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createListingSchema.parse(req.body);
      const userId = req.userId as string;

      const listing = await listingService.createListing(userId, input);
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  },
};