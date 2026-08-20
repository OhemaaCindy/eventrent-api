import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

export const orderRoutes = Router();

orderRoutes.post("/", authMiddleware, orderController.create);
orderRoutes.post("/recurring", authMiddleware, orderController.createRecurring);
orderRoutes.get("/:id", authMiddleware, orderController.getById);
