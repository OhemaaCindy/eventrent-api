import { Router } from "express";
import { ownerController } from "../controllers/ownerController";
import { authMiddleware } from "../middleware/authMiddleware";

export const ownerRoutes = Router();

ownerRoutes.post("/me", authMiddleware, ownerController.createOwnerProfile);