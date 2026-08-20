import crypto from "crypto";
import { authRepository } from "../repositories/authRepository";
import { magicLinkRepository } from "../repositories/magicLinkRepository";
import { emailVerificationRepository } from "../repositories/emailVerificationRepository";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/token";
import { emailSender } from "../lib/email";
import { AppError } from "../middleware/errorHandler";
import { AuthProvider } from "../generated/prisma/client";
import { exchangeCodeForUserInfo } from "../lib/googleOAuth";
import type { RegisterInput, LoginInput } from "../types/auth";

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

    await issueEmailVerification(user.id, user.email);

    return issueTokens(user.id, user.email);
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

    return issueTokens(user.id, user.email);
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token");
    }

    return issueTokens(payload.userId, payload.email);
  },

  async requestMagicLink(email: string) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await magicLinkRepository.create(email, tokenHash, expiresAt);

    const link = `http://localhost:5173/auth/magic-link/verify?token=${rawToken}`;
    await emailSender.sendMagicLink(email, link);
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

    return issueTokens(user.id, user.email);
  },

  async loginWithGoogle(code: string) {
    const googleUser = await exchangeCodeForUserInfo(code);
    const user = await authRepository.findOrCreateGoogleUser(
      googleUser.sub,
      googleUser.email,
      googleUser.name
    );
    return issueTokens(user.id, user.email);
  },

  async verifyEmail(rawToken: string) {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const record = await emailVerificationRepository.findValidByHash(tokenHash);

    if (!record) {
      throw new AppError(401, "INVALID_VERIFICATION_TOKEN", "This link is invalid or has expired");
    }

    await emailVerificationRepository.markUsed(record.id);
    await authRepository.markEmailVerified(record.userId);
  },

  async resendVerificationEmail(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const passwordIdentity = user.authIdentities.find(
      (identity) => identity.provider === AuthProvider.PASSWORD
    );
    if (!passwordIdentity) {
      throw new AppError(400, "NO_PASSWORD_IDENTITY", "This account has no password login to verify");
    }
    if (passwordIdentity.emailVerified) {
      throw new AppError(409, "ALREADY_VERIFIED", "This email is already verified");
    }

    await issueEmailVerification(user.id, user.email);
  },
};

function issueTokens(userId: string, email: string) {
  return {
    accessToken: signAccessToken({ userId, email }),
    refreshToken: signRefreshToken({ userId, email }),
  };
}

async function issueEmailVerification(userId: string, email: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h — not urgent like a login link

  await emailVerificationRepository.create(userId, tokenHash, expiresAt);

  const link = `http://localhost:5173/auth/verify-email?token=${rawToken}`;
  await emailSender.sendVerificationEmail(email, link);
}