import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

export const adminRoutes = Router();

adminRoutes.get(
  "/owners/pending",
  authMiddleware,
  adminMiddleware,
  adminController.listPendingVerifications
);
adminRoutes.post(
  "/owners/:id/verify",
  authMiddleware,
  adminMiddleware,
  adminController.approveOwner
);
adminRoutes.post(
  "/owners/:id/reject",
  authMiddleware,
  adminMiddleware,
  adminController.rejectOwner
);
adminRoutes.post(
  "/disputes/:id/resolve",
  authMiddleware,
  adminMiddleware,
  adminController.resolveDispute
);
adminRoutes.get(
  "/payouts",
  authMiddleware,
  adminMiddleware,
  adminController.listPayouts
);
adminRoutes.post(
  "/payouts/:id/mark-paid",
  authMiddleware,
  adminMiddleware,
  adminController.markPayoutPaid
);