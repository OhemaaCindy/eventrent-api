import { Router } from "express";
import { bookingController } from "../controllers/bookingController";
import { authMiddleware } from "../middleware/authMiddleware";

export const bookingRoutes = Router();
bookingRoutes.post("/", authMiddleware, bookingController.create);