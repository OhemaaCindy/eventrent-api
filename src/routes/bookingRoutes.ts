import { Router } from "express";
import { bookingController } from "../controllers/bookingController";
import { authMiddleware } from "../middleware/authMiddleware";
import { depositController } from "../controllers/depositController";
import { messageController } from "../controllers/messageController";
import { reviewController } from "../controllers/reviewController";
import { uploadImage } from "../middleware/upload";

export const bookingRoutes = Router();
bookingRoutes.post("/", authMiddleware, bookingController.create);
bookingRoutes.get("/", authMiddleware, bookingController.list);
bookingRoutes.post("/:id/return", authMiddleware, depositController.confirmReturnByRenter);
bookingRoutes.post("/:id/confirm-return", authMiddleware, depositController.confirmReturn);
bookingRoutes.post(
  "/:id/dispute",
  authMiddleware,
  uploadImage.array("evidence", 5),
  depositController.openDispute
);
bookingRoutes.post("/:id/messages", authMiddleware, messageController.send);
bookingRoutes.get("/:id/messages", authMiddleware, messageController.list);
bookingRoutes.post("/:id/reviews", authMiddleware, reviewController.create);
bookingRoutes.post("/:id/cancel", authMiddleware, bookingController.cancel);