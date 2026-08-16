import { Response, NextFunction, Request} from "express";
import { listingService } from "../services/listingService";
import { createListingSchema } from "../types/listing";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { listingRepository } from "../repositories/listingRepository";
import { AppError } from "../middleware/errorHandler";

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
async list(_req: Request, res: Response, next: NextFunction) {
  try {
    const listings = await listingRepository.findMany();
    res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
},

async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await listingRepository.findById(req.params.id as string);
    if (!listing) {
      throw new AppError(404, "LISTING_NOT_FOUND", "Listing not found");
    }
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
},
  
};

