import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

export const adminRoutes = Router();

adminRoutes.post(
  "/owners/:id/verify",
  authMiddleware,
  adminMiddleware,
  adminController.approveOwner
);