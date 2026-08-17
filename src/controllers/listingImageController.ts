import { Response, NextFunction } from "express";
import { listingImageService } from "../services/listingImageService";
import { AppError } from "../middleware/errorHandler";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const listingImageController = {
  async upload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const listingId = req.params.id as string;

      if (!req.file) {
        throw new AppError(400, "NO_FILE", "No image file provided");
      }

      const image = await listingImageService.addImage(userId, listingId, req.file.buffer);
      res.status(201).json(image);
    } catch (err) {
      next(err);
    }
  },
};