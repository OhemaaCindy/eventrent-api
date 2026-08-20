import { Response, NextFunction, Request} from "express";
import { listingService } from "../services/listingService";
import { createListingSchema, updateListingSchema, browseListingsSchema } from "../types/listing";
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
async list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = browseListingsSchema.parse(req.query);
    const listings = await listingService.browseListings(filters);
    res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
},

async listMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId as string;
    const listings = await listingService.getMyListings(userId);
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

async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = updateListingSchema.parse(req.body);
    const userId = req.userId as string;
    const listingId = req.params.id as string;

    const listing = await listingService.updateListing(userId, listingId, input);
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
},

async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId as string;
    const listingId = req.params.id as string;

    await listingService.deleteListing(userId, listingId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
},

async publish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId as string;
    const listingId = req.params.id as string;

    const listing = await listingService.publishListing(userId, listingId);
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
},
};

