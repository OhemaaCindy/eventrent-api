import { Router } from "express";
import { eventController } from "../controllers/eventController";
import { authMiddleware } from "../middleware/authMiddleware";

export const eventRoutes = Router();

eventRoutes.post("/", authMiddleware, eventController.create);
eventRoutes.get("/", authMiddleware, eventController.list);
eventRoutes.get("/:id", authMiddleware, eventController.getById);
eventRoutes.delete("/:id", authMiddleware, eventController.remove);
eventRoutes.post("/:id/bookings/:bookingId", authMiddleware, eventController.attachBooking);
eventRoutes.delete("/:id/bookings/:bookingId", authMiddleware, eventController.detachBooking);
