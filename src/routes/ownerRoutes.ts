import { Router } from "express";
import { ownerController } from "../controllers/ownerController";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadImage } from "../middleware/upload";

export const ownerRoutes = Router();

ownerRoutes.post("/me", authMiddleware, ownerController.createOwnerProfile);
ownerRoutes.post(
  "/me/documents",
  authMiddleware,
  uploadImage.array("documents", 5),
  ownerController.uploadVerificationDocuments
);