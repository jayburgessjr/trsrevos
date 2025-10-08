import { PrismaClient } from '@prisma/client'

type GlobalPrisma = {
  prisma?: PrismaClient
}

const globalForPrisma = globalThis as GlobalPrisma

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
