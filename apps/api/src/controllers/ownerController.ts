import { Response, NextFunction } from "express";
import { ownerService } from "../services/ownerService";
import { createOwnerProfileSchema } from "../types/owner";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const ownerController = {
  async createOwnerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createOwnerProfileSchema.parse(req.body);
      const userId = req.userId as string; // guaranteed set by authMiddleware before this runs

      const ownerProfile = await ownerService.createOwnerProfile(userId, input);
      res.status(201).json(ownerProfile);
    } catch (err) {
      next(err);
    }
  },

  async uploadVerificationDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];

      const owner = await ownerService.addVerificationDocuments(userId, files);
      res.status(200).json(owner);
    } catch (err) {
      next(err);
    }
  },
};