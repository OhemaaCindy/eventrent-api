import { prisma } from "../lib/prisma";
import { AuthProvider } from "../generated/prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { authIdentities: true },
    });
  },

  findAuthIdentity(userId: string, provider: AuthProvider) {
    return prisma.authIdentity.findFirst({
      where: { userId, provider },
    });
  },

  async createUserWithPassword(email: string, name: string, passwordHash: string) {
    return prisma.user.create({
      data: {
        email,
        name,
        authIdentities: {
          create: {
            provider: AuthProvider.PASSWORD,
            passwordHash,
            emailVerified: false,
          },
        },
      },
      include: { authIdentities: true },
    });
  },

  async createUserWithMagicLink(email: string) {
    return prisma.user.create({
      data: {
        email,
        name: email.split("@")[0] ?? email, // placeholder name, user can update later
        authIdentities: {
          create: {
            provider: AuthProvider.MAGIC_LINK,
            emailVerified: true, // clicking the emailed link proves ownership
          },
        },
      },
      include: { authIdentities: true },
    });
  },
};