import { Router } from "express";
import { bookingController } from "../controllers/bookingController";
import { authMiddleware } from "../middleware/authMiddleware";
import { depositController } from "../controllers/depositController";
import { uploadImage } from "../middleware/upload";

export const bookingRoutes = Router();
bookingRoutes.post("/", authMiddleware, bookingController.create);
bookingRoutes.get("/", authMiddleware, bookingController.list);
bookingRoutes.post("/:id/confirm-return", authMiddleware, depositController.confirmReturn);
bookingRoutes.post(
  "/:id/dispute",
  authMiddleware,
  uploadImage.array("evidence", 5),
  depositController.openDispute
);