import { Response, NextFunction } from "express";
import { adminService } from "../services/adminService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const adminController = {
  async approveOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const owner = await adminService.approveOwner(ownerId);
      res.status(200).json(owner);
    } catch (err) {
      next(err);
    }
  },
};