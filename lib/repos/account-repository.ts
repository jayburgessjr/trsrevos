import type { PrismaClient, TrsAccount } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type AccountModel = Pick<PrismaClient['trsAccount'], 'findUnique'>

export class AccountRepository {
  constructor(private readonly model: AccountModel) {}

  async findBySlug(slug: string): Promise<TrsAccount | null> {
    return this.model.findUnique({ where: { slug } })
  }
}

export const accountRepository = new AccountRepository(prisma.trsAccount)
