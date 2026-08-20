import { Response, NextFunction } from "express";
import { eventService } from "../services/eventService";
import { createEventSchema } from "../types/event";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const eventController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createEventSchema.parse(req.body);
      const userId = req.userId as string;

      const event = await eventService.createEvent(userId, input);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const events = await eventService.listEvents(userId);
      res.status(200).json(events);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const eventId = req.params.id as string;

      const event = await eventService.getEventById(userId, eventId);
      res.status(200).json(event);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const eventId = req.params.id as string;

      await eventService.deleteEvent(userId, eventId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async attachBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const eventId = req.params.id as string;
      const bookingId = req.params.bookingId as string;

      const booking = await eventService.attachBooking(userId, eventId, bookingId);
      res.status(200).json(booking);
    } catch (err) {
      next(err);
    }
  },

  async detachBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const eventId = req.params.id as string;
      const bookingId = req.params.bookingId as string;

      const booking = await eventService.detachBooking(userId, eventId, bookingId);
      res.status(200).json(booking);
    } catch (err) {
      next(err);
    }
  },
};
