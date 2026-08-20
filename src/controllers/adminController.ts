import { Response, NextFunction } from "express";
import { adminService } from "../services/adminService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { depositService } from "../services/depositService";
import { resolveDisputeSchema } from "../types/dispute";

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
  async rejectOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.params.id as string;
      const owner = await adminService.rejectOwner(ownerId);
      res.status(200).json(owner);
    } catch (err) {
      next(err);
    }
  },

  async listPendingVerifications(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const owners = await adminService.listPendingVerifications();
      res.status(200).json(owners);
    } catch (err) {
      next(err);
    }
  },

  async resolveDispute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const disputeId = req.params.id as string;
    const adminUserId = req.userId as string;
    const { resolution } = resolveDisputeSchema.parse(req.body);

    const result = await depositService.resolveDispute(disputeId, resolution, adminUserId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
},

  async listPayouts(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payouts = await adminService.listPayouts();
      res.status(200).json(payouts);
    } catch (err) {
      next(err);
    }
  },

  async markPayoutPaid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payoutId = req.params.id as string;
      const payout = await adminService.markPayoutPaid(payoutId);
      res.status(200).json(payout);
    } catch (err) {
      next(err);
    }
  },
};