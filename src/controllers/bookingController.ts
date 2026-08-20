import { Response, NextFunction } from "express";
import { bookingService } from "../services/bookingService";
import { createBookingSchema } from "../types/booking";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { bookingRepository } from "../repositories/bookingRepository";

export const bookingController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createBookingSchema.parse(req.body);
      const renterId = req.userId as string;
      const renterEmail = req.userEmail as string;

      const result = await bookingService.createBooking(renterId, input, renterEmail);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const renterId = req.userId as string;
      const bookings = await bookingRepository.findByRenterId(renterId);
      res.status(200).json(bookings);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const bookingId = req.params.id as string;

      const result = await bookingService.cancelBooking(userId, bookingId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};