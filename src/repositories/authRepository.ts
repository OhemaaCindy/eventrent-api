import { prisma } from "../lib/prisma";
import { AuthProvider } from "../generated/prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { authIdentities: true },
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { authIdentities: true },
    });
  },

  markEmailVerified(userId: string) {
    return prisma.authIdentity.updateMany({
      where: { userId, provider: AuthProvider.PASSWORD },
      data: { emailVerified: true },
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

  async findOrCreateGoogleUser(googleId: string, email: string, name: string) {
  const existingIdentity = await prisma.authIdentity.findFirst({
    where: { provider: AuthProvider.GOOGLE, providerUserId: googleId },
    include: { user: true },
  });

  if (existingIdentity) {
    return existingIdentity.user;
  }

  const existingUserByEmail = await prisma.user.findUnique({ where: { email } });

  if (existingUserByEmail) {
    await prisma.authIdentity.create({
      data: {
        userId: existingUserByEmail.id,
        provider: AuthProvider.GOOGLE,
        providerUserId: googleId,
        emailVerified: true,
      },
    });
    return existingUserByEmail;
  }

  return prisma.user.create({
    data: {
      email,
      name,
      authIdentities: {
        create: {
          provider: AuthProvider.GOOGLE,
          providerUserId: googleId,
          emailVerified: true,
        },
      },
    },
  });
}
};