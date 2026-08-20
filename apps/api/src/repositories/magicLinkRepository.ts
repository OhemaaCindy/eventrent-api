import { prisma } from "../lib/prisma";

export const magicLinkRepository = {
  create(email: string, tokenHash: string, expiresAt: Date) {
    return prisma.magicLinkToken.create({
      data: { email, tokenHash, expiresAt },
    });
  },

  findValidByHash(tokenHash: string) {
    return prisma.magicLinkToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  },

  markUsed(id: string) {
    return prisma.magicLinkToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};