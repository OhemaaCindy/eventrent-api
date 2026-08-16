import { Router } from "express";
import { listingController } from "../controllers/listingController";
import { authMiddleware } from "../middleware/authMiddleware";

export const listingRoutes = Router();

listingRoutes.post("/", authMiddleware, listingController.create);