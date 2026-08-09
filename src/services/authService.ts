import { authRepository } from "../repositories/authRepository";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken, signRefreshToken } from "../lib/token";
import { AppError } from "../middleware/errorHandler";
import { AuthProvider } from "../generated/prisma/client";
import type { RegisterInput, LoginInput } from "../types/auth";
import { verifyRefreshToken } from "../lib/token";

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
};

function issueTokens(userId: string) {
  return {
    accessToken: signAccessToken({ userId }),
    refreshToken: signRefreshToken({ userId }),
  };
}