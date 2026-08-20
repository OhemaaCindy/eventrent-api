import { Router } from "express";
import { messageController } from "../controllers/messageController";
import { authMiddleware } from "../middleware/authMiddleware";

export const messageRoutes = Router();

messageRoutes.get("/inbox", authMiddleware, messageController.inbox);
