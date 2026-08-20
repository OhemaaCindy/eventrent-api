import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "./errorHandler";
import type { AuthenticatedRequest } from "./authMiddleware";

export async function adminMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.isAdmin) {
      throw new AppError(403, "NOT_ADMIN", "This action requires admin privileges");
    }

    next();
  } catch (err) {
    next(err);
  }
}