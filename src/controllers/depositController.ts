import { Response, NextFunction } from "express";
import { depositService } from "../services/depositService";
import { openDisputeSchema } from "../types/dispute";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const depositController = {
  async confirmReturnByRenter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const bookingId = req.params.id as string;

      const result = await depositService.confirmReturnByRenter(userId, bookingId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async confirmReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const bookingId = req.params.id as string;

      const result = await depositService.confirmReturn(userId, bookingId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async openDispute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const bookingId = req.params.id as string;
      const { reason } = openDisputeSchema.parse(req.body);
      const evidenceFiles = (req.files as Express.Multer.File[] | undefined) ?? [];

      const result = await depositService.openDispute(userId, bookingId, reason, evidenceFiles);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
};