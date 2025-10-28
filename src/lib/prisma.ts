import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient | undefined {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  if (!prismaClient) {
    prismaClient = globalThis.prisma ?? new PrismaClient();

    if (process.env.NODE_ENV !== 'production') {
      globalThis.prisma = prismaClient;
    }
  }

  return prismaClient;
}

export const prisma = getPrismaClient();
