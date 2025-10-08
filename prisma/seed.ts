import { PrismaClient } from '@prisma/client'

import { computeTrsScore } from '../lib/trs/score'

const prisma = new PrismaClient()

async function seed() {
  const account = await prisma.trsAccount.upsert({
    where: { slug: 'demo' },
    update: {
      name: 'Demo Enterprise',
      tier: 'Enterprise'
    },
    create: {
      id: 'demo-account',
      name: 'Demo Enterprise',
      slug: 'demo',
      tier: 'Enterprise'
    }
  })

  await prisma.trsScore.deleteMany({ where: { accountId: account.id } })

  const scoreInputs = {
    cac: 3.2,
    nrr: 118,
    churn: 4.1,
    payback: 9,
    margin: 68,
    forecastMape: 12,
    velocity: 1.6,
    incidents: 0.8
  }

  const computed = computeTrsScore(scoreInputs)

  await prisma.trsScore.create({
    data: {
      accountId: account.id,
      ...scoreInputs,
      score: computed.score,
      band: computed.band,
      drivers: computed.drivers,
      computedAt: new Date('2024-10-01T12:00:00.000Z')
    }
  })

  await prisma.deliverable.create({
    data: {
      accountId: account.id,
      type: 'CLARITY_AUDIT',
      title: 'Clarity Audit – RevenueOS Readiness',
      status: 'IN_PROGRESS',
      owner: 'Alex Rivera',
      dueDate: new Date('2024-10-15T00:00:00.000Z'),
      lastReviewAt: new Date('2024-09-27T00:00:00.000Z'),
      exportLink: 'https://drive.google.com/demo-clarity-audit'
    }
  })

  const agent = await prisma.agent.upsert({
    where: { slug: 'forecast-iq' },
    update: {
      name: 'ForecastIQ',
      description: 'Owns MAPE guardrails and pipeline signal monitoring.',
      kpi: 'MAPE ≤ 10%'
    },
    create: {
      slug: 'forecast-iq',
      name: 'ForecastIQ',
      description: 'Owns MAPE guardrails and pipeline signal monitoring.',
      kpi: 'MAPE ≤ 10%'
    }
  })

  await prisma.modelCard.upsert({
    where: { agentId_accountId_version: { agentId: agent.id, accountId: account.id, version: 'v1.0.0' } },
    update: {
      f1Score: 0.82,
      forecastMape: 9.4,
      decisionRight: 'AUTO',
      nextRetrainAt: new Date('2024-11-05T00:00:00.000Z'),
      approver: 'Priya Shah',
      status: 'Active'
    },
    create: {
      agentId: agent.id,
      accountId: account.id,
      name: 'ForecastIQ primary forecaster',
      version: 'v1.0.0',
      f1Score: 0.82,
      forecastMape: 9.4,
      decisionRight: 'AUTO',
      nextRetrainAt: new Date('2024-11-05T00:00:00.000Z'),
      approver: 'Priya Shah',
      status: 'Active'
    }
  })

  await prisma.governanceAction.create({
    data: {
      accountId: account.id,
      title: 'AI Engine Compliance review',
      status: 'OPEN',
      roiHypothesis: 'Reduce forecast variance by 5% with guardrail tuning.',
      paybackWindowMonths: 6,
      trsLever: 'Forecast accuracy',
      owner: 'Priya Shah'
    }
  })

  await prisma.contentItem.create({
    data: {
      accountId: account.id,
      title: 'Q3 ARR Narrative',
      source: 'Notion',
      path: '/trs/copilot/q3-arr-narrative',
      summary: 'Highlights ARR momentum and partner sourced pipeline.',
      metadata: {
        tags: ['ARR', 'Executive', 'Narrative']
      },
      lastIndexedAt: new Date('2024-09-10T12:00:00.000Z')
    }
  })

  await prisma.lastSync.upsert({
    where: { integration: 'notion' },
    update: {
      cursor: '2024-09-10T12:00:00.000Z',
      syncedAt: new Date('2024-09-10T12:05:00.000Z'),
      accountId: account.id
    },
    create: {
      integration: 'notion',
      cursor: '2024-09-10T12:00:00.000Z',
      syncedAt: new Date('2024-09-10T12:05:00.000Z'),
      accountId: account.id
    }
  })

  await prisma.agentBinding.upsert({
    where: {
      agentId_accountId_kpi: {
        agentId: agent.id,
        accountId: account.id,
        kpi: 'MAPE ≤ 10%'
      }
    },
    update: {},
    create: {
      agentId: agent.id,
      accountId: account.id,
      kpi: 'MAPE ≤ 10%'
    }
  })
}

seed()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
