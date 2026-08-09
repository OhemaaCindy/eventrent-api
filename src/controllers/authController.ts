import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { registerSchema, loginSchema } from "../types/auth";
import { AppError } from "../middleware/errorHandler";

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
};