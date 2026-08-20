import { Response, NextFunction } from "express";
import { messageService } from "../services/messageService";
import { sendMessageSchema } from "../types/message";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const messageController = {
  async send(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { body } = sendMessageSchema.parse(req.body);
      const userId = req.userId as string;
      const bookingId = req.params.id as string;

      const message = await messageService.sendMessage(userId, bookingId, body);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const bookingId = req.params.id as string;

      const messages = await messageService.listMessages(userId, bookingId);
      res.status(200).json(messages);
    } catch (err) {
      next(err);
    }
  },

  async inbox(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const conversations = await messageService.getInbox(userId);
      res.status(200).json(conversations);
    } catch (err) {
      next(err);
    }
  },
};
