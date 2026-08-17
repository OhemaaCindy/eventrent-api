import { Router } from "express";
import { listingController } from "../controllers/listingController";
import { authMiddleware } from "../middleware/authMiddleware";
import { listingImageController } from "../controllers/listingImageController";
import { uploadImage } from "../middleware/upload";

export const listingRoutes = Router();

listingRoutes.post("/", authMiddleware, listingController.create);
listingRoutes.get("/", listingController.list);
listingRoutes.get("/:id", listingController.getById);
listingRoutes.post("/:id/images", authMiddleware, uploadImage.single("image"), listingImageController.upload);