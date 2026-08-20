import { Router } from "express";
import { listingController } from "../controllers/listingController";
import { authMiddleware } from "../middleware/authMiddleware";
import { listingImageController } from "../controllers/listingImageController";
import { reviewController } from "../controllers/reviewController";
import { uploadImage } from "../middleware/upload";

export const listingRoutes = Router();

listingRoutes.post("/", authMiddleware, listingController.create);
listingRoutes.get("/", listingController.list);
listingRoutes.get("/mine", authMiddleware, listingController.listMine);
listingRoutes.get("/:id", listingController.getById);
listingRoutes.patch("/:id", authMiddleware, listingController.update);
listingRoutes.delete("/:id", authMiddleware, listingController.remove);
listingRoutes.post("/:id/publish", authMiddleware, listingController.publish);
listingRoutes.post("/:id/images", authMiddleware, uploadImage.single("image"), listingImageController.upload);
listingRoutes.get("/:id/reviews", reviewController.listForListing);