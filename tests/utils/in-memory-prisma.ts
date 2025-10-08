type AccountRecord = {
  id: string
  slug: string
  name: string
  tier?: string | null
}

type TrsScoreRecord = {
  id: string
  accountId: string
  cac: number
  nrr: number
  churn: number
  payback: number
  margin: number
  forecastMape: number
  velocity: number
  incidents: number
  score: number
  band: 'RED' | 'YELLOW' | 'GREEN'
  drivers: unknown
  computedAt: Date
  createdAt: Date
}

type DeliverableRecord = {
  id: string
  accountId: string
  type: string
  title: string
  status: string
  owner: string
  dueDate: Date | null
  lastReviewAt: Date | null
  exportLink: string | null
  createdAt: Date
  updatedAt: Date
}

let idCounter = 0

function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${idCounter}`
}

export function createInMemoryPrisma() {
  const accounts = new Map<string, AccountRecord>()
  const scores: TrsScoreRecord[] = []
  const deliverables: DeliverableRecord[] = []

  const prisma = {
    trsAccount: {
      async findUnique(args: { where: { id?: string; slug?: string } }) {
        if (args.where.id) {
          return accounts.get(args.where.id) ?? null
        }
        if (args.where.slug) {
          for (const account of accounts.values()) {
            if (account.slug === args.where.slug) {
              return account
            }
          }
        }
        return null
      },
      async create(args: { data: AccountRecord }) {
        const id = args.data.id ?? nextId('acc')
        const record: AccountRecord = {
          id,
          name: args.data.name,
          slug: args.data.slug,
          tier: args.data.tier ?? null
        }
        accounts.set(id, record)
        return record
      }
    },
    trsScore: {
      async create(args: { data: Omit<TrsScoreRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: Date } }) {
        const id = args.data.id ?? nextId('score')
        const record: TrsScoreRecord = {
          id,
          accountId: args.data.accountId,
          cac: args.data.cac,
          nrr: args.data.nrr,
          churn: args.data.churn,
          payback: args.data.payback,
          margin: args.data.margin,
          forecastMape: args.data.forecastMape,
          velocity: args.data.velocity,
          incidents: args.data.incidents,
          score: args.data.score,
          band: args.data.band,
          drivers: args.data.drivers,
          computedAt: args.data.computedAt,
          createdAt: args.data.createdAt ?? new Date()
        }
        scores.push(record)
        return record
      },
      async findFirst(args: { where: { accountId: string }; orderBy?: { computedAt: 'asc' | 'desc' } }) {
        const filtered = scores.filter((score) => score.accountId === args.where.accountId)
        if (args.orderBy?.computedAt === 'desc') {
          filtered.sort((a, b) => b.computedAt.getTime() - a.computedAt.getTime())
        } else if (args.orderBy?.computedAt === 'asc') {
          filtered.sort((a, b) => a.computedAt.getTime() - b.computedAt.getTime())
        }
        return filtered[0] ?? null
      }
    },
    deliverable: {
      async create(args: { data: Omit<DeliverableRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } }) {
        const id = args.data.id ?? nextId('deliv')
        const now = new Date()
        const record: DeliverableRecord = {
          id,
          accountId: args.data.accountId,
          type: args.data.type,
          title: args.data.title,
          status: args.data.status,
          owner: args.data.owner,
          dueDate: args.data.dueDate ?? null,
          lastReviewAt: args.data.lastReviewAt ?? null,
          exportLink: args.data.exportLink ?? null,
          createdAt: now,
          updatedAt: now
        }
        deliverables.push(record)
        return record
      },
      async findMany(args: { where: { accountId: string }; orderBy?: Array<Record<string, 'asc' | 'desc'>> }) {
        const filtered = deliverables.filter((deliverable) => deliverable.accountId === args.where.accountId)
        if (args.orderBy && args.orderBy.length > 0) {
          const [firstOrder] = args.orderBy
          const [field, direction] = Object.entries(firstOrder)[0]
          filtered.sort((a, b) => {
            const aValue = (a as Record<string, unknown>)[field]
            const bValue = (b as Record<string, unknown>)[field]
            if (aValue === bValue) {
              return 0
            }
            if (aValue === null || aValue === undefined) {
              return 1
            }
            if (bValue === null || bValue === undefined) {
              return -1
            }
            if (aValue instanceof Date && bValue instanceof Date) {
              return direction === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime()
            }
            return direction === 'asc'
              ? String(aValue).localeCompare(String(bValue))
              : String(bValue).localeCompare(String(aValue))
          })
        }
        return filtered
      }
    }
  }

  return {
    prisma,
    addAccount(account: Omit<AccountRecord, 'id'> & { id?: string }) {
      const id = account.id ?? nextId('acc')
      accounts.set(id, { id, name: account.name, slug: account.slug, tier: account.tier ?? null })
      return id
    }
  }
}
