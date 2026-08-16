import { Response, NextFunction } from "express";
import { bookingService } from "../services/bookingService";
import { createBookingSchema } from "../types/booking";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const bookingController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createBookingSchema.parse(req.body);
      const renterId = req.userId as string;

      const booking = await bookingService.createBooking(renterId, input);
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  },
};