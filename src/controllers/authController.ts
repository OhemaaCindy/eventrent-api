import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { registerSchema, loginSchema } from "../types/auth";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches refresh token expiry
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
};