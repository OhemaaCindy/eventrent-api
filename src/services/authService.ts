import { authRepository } from "../repositories/authRepository";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken, signRefreshToken } from "../lib/token";
import { AppError } from "../middleware/errorHandler";
import { AuthProvider } from "../generated/prisma/client";
import type { RegisterInput, LoginInput } from "../types/auth";
import { verifyRefreshToken } from "../lib/token";
import crypto from "crypto";
import { magicLinkRepository } from "../repositories/magicLinkRepository";
import { emailSender } from "../lib/email";


export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new AppError(409, "EMAIL_IN_USE", "An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUserWithPassword(
      input.email,
      input.name,
      passwordHash
    );

    return issueTokens(user.id);
  },

  async login(input: LoginInput) {
    const genericError = () =>
      new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");

    const user = await authRepository.findUserByEmail(input.email);
    if (!user) throw genericError();

    const passwordIdentity = user.authIdentities.find(
      (identity) => identity.provider === AuthProvider.PASSWORD
    );
    if (!passwordIdentity || !passwordIdentity.passwordHash) throw genericError();

    const isValid = await verifyPassword(input.password, passwordIdentity.passwordHash);
    if (!isValid) throw genericError();

    return issueTokens(user.id);
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token");
    }

    return issueTokens(payload.userId);
  },

  async requestMagicLink(email: string) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await magicLinkRepository.create(email, tokenHash, expiresAt);

    const link = `http://localhost:5173/auth/magic-link/verify?token=${rawToken}`;
    await emailSender.sendMagicLink(email, link);

    // Always return success, whether or not the email exists — same enumeration
    // protection principle as login. We don't want to confirm/deny account existence.
  },

  async verifyMagicLink(rawToken: string) {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const record = await magicLinkRepository.findValidByHash(tokenHash);

    if (!record) {
      throw new AppError(401, "INVALID_MAGIC_LINK", "This link is invalid or has expired");
    }

    await magicLinkRepository.markUsed(record.id);

    let user = await authRepository.findUserByEmail(record.email);

    if (!user) {
      user = await authRepository.createUserWithMagicLink(record.email);
    }

    return issueTokens(user.id);
  },
};

function issueTokens(userId: string) {
  return {
    accessToken: signAccessToken({ userId }),
    refreshToken: signRefreshToken({ userId }),
  };
}