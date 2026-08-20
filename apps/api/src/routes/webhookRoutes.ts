import { Router } from "express";
import express from "express";
import { webhookController } from "../controllers/webhookController";

export const webhookRoutes = Router();

webhookRoutes.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  webhookController.handlePaystackWebhook
);