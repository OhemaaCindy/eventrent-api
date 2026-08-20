import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { registerSchema, loginSchema } from "../types/auth";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";
import { buildGoogleAuthUrl } from "../lib/googleOAuth";
import { env } from "../lib/env";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const { accessToken, refreshToken } = await authService.register(input);

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const { accessToken, refreshToken } = await authService.login(input);

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        throw new AppError(401, "NO_REFRESH_TOKEN", "No refresh token provided");
      }

      const { accessToken, refreshToken } = await authService.refresh(token);

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "lax", path: "/" });
    res.status(204).send();
  },

  async requestMagicLink(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      if (!email || typeof email !== "string") {
        throw new AppError(400, "VALIDATION_ERROR", "Email is required");
      }

      await authService.requestMagicLink(email);
      res.status(200).json({ message: "If that email exists, a magic link has been sent." });
    } catch (err) {
      next(err);
    }
  },

  async verifyMagicLink(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token;
      if (!token || typeof token !== "string") {
        throw new AppError(400, "VALIDATION_ERROR", "Token is required");
      }

      const { accessToken, refreshToken } = await authService.verifyMagicLink(token);

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token;
      if (!token || typeof token !== "string") {
        throw new AppError(400, "VALIDATION_ERROR", "Token is required");
      }

      await authService.verifyEmail(token);
      res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
      next(err);
    }
  },

  async resendVerificationEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      await authService.resendVerificationEmail(userId);
      res.status(200).json({ message: "Verification email resent." });
    } catch (err) {
      next(err);
    }
  },

  redirectToGoogle(_req: Request, res: Response) {
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000, // 5 minutes — this cookie only needs to survive the round trip to Google and back
  });

  res.redirect(buildGoogleAuthUrl(state));
},

async googleCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies.oauth_state;

    res.clearCookie("oauth_state");

    if (!state || state !== savedState) {
      throw new AppError(401, "INVALID_OAUTH_STATE", "OAuth state mismatch — possible CSRF attempt");
    }

    if (!code || typeof code !== "string") {
      throw new AppError(400, "MISSING_CODE", "No authorization code received from Google");
    }

    const { refreshToken } = await authService.loginWithGoogle(code);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.redirect(`${env.FRONTEND_URL}/auth/callback`);
  } catch (err) {
    next(err);
  }
},
};