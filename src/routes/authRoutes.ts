import { Router } from "express";
import { authController } from "../controllers/authController";
import { authRateLimiter } from "../middleware/rateLimiter";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRoutes = Router();

authRoutes.post("/register", authRateLimiter, authController.register);
authRoutes.post("/login", authRateLimiter, authController.login);
authRoutes.post("/refresh", authRateLimiter, authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/magic-link", authRateLimiter, authController.requestMagicLink);
authRoutes.get("/magic-link/verify", authController.verifyMagicLink);
authRoutes.get("/google", authController.redirectToGoogle);
authRoutes.get("/google/callback", authController.googleCallback);
authRoutes.get("/verify-email", authController.verifyEmail);
authRoutes.post(
  "/verify-email/resend",
  authRateLimiter,
  authMiddleware,
  authController.resendVerificationEmail
);