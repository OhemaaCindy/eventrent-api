import { Response, NextFunction } from "express";
import { orderService } from "../services/orderService";
import { createOrderSchema, createRecurringOrderSchema } from "../types/order";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const orderController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createOrderSchema.parse(req.body);
      const renterId = req.userId as string;
      const renterEmail = req.userEmail as string;

      const result = await orderService.createOrder(renterId, input, renterEmail);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async createRecurring(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createRecurringOrderSchema.parse(req.body);
      const renterId = req.userId as string;
      const renterEmail = req.userEmail as string;

      const result = await orderService.createRecurringOrder(renterId, input, renterEmail);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const orderId = req.params.id as string;

      const order = await orderService.getOrderById(userId, orderId);
      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  },
};
