import { register } from './bus'
import { Agent } from './types'

const make = (meta: Agent['meta'], run: Agent['run'], samplePayload?: any): Agent => ({
  meta,
  run,
  samplePayload,
})

// Projects
register(
  make(
    {
      key: 'delivery-orchestrator',
      name: 'Delivery Orchestrator',
      category: 'Projects',
      description: 'Advance RevOS phases and generate next 3 actions',
      icon: 'Workflow',
      autoRunnable: true,
    },
    async ({ userId, payload }) => ({
      ok: true,
      summary: 'Set phase to Data; queued 3 next actions.',
      data: {
        phase: 'Data',
        next: ['Interview billing owner', 'Connect Stripe', 'Sample cohort export'],
        expectedImpact$: 3000,
        runBy: userId,
        payload,
      },
    }),
    { clientId: 'acme-co', focus: 'billing' },
  ),
)
register(
  make(
    {
      key: 'gap-discovery',
      name: 'Gap Discovery',
      category: 'Projects',
      description: 'Run gap questions; extract levers',
      icon: 'Search',
    },
    async () => ({
      ok: true,
      summary: 'Captured 12 answers; proposed 3 levers.',
      data: {
        levers: [
          { name: 'Raise Plus 5%', impact$: 4000 },
          { name: 'Prepay incentive', impact$: 2500 },
          { name: 'Partner co-sell', impact$: 5000 },
        ],
        expectedImpact$: 11500,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'data-intake',
      name: 'Data Intake',
      category: 'Projects',
      description: 'Map available vs collected data',
      icon: 'Database',
    },
    async () => ({
      ok: true,
      summary: '8/12 sources ready; flagged missing ARR field.',
      data: {
        completeness: 0.67,
        missing: ['ARR', 'ChurnReason'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'qra-strategy',
      name: 'QRA Strategy',
      category: 'Projects',
      description: 'Compute price/offer/channel moves',
      icon: 'Brain',
    },
    async () => ({
      ok: true,
      summary: 'Proposed pricing + retention play.',
      data: {
        pricing: '+5% Plus; floor 12% disc',
        retention: 'N-day save sequence',
        expectedImpact$: 9000,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'build-planner',
      name: 'Build Planner',
      category: 'Projects',
      description: 'Create Kanban plan and SLOs',
      icon: 'Kanban',
    },
    async () => ({
      ok: true,
      summary: 'Critical path set; 2 SLOs risk.',
      data: {
        columns: ['Backlog', 'Doing', 'Blocked', 'Review', 'Done'],
        sloRisks: ['Auth latency p95', 'Invoice job'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'compounding',
      name: 'Compounding',
      category: 'Projects',
      description: 'Quantify new revenue vs baseline',
      icon: 'BarChart2',
    },
    async () => ({
      ok: true,
      summary: '$12.4k net new vs baseline; QTD forecast +$48k.',
      data: {
        dollarsAdvanced$: 12400,
        forecastQTD: 48000,
      },
    }),
  ),
)

// Content
register(
  make(
    {
      key: 'media-agent',
      name: 'Media Agent',
      category: 'Content',
      description: 'Podcast + YouTube + shorts bundle',
      icon: 'Mic',
      autoRunnable: true,
    },
    async () => ({
      ok: true,
      summary: 'Generated pod + YT plan; 3 shorts; scheduled LI & Email.',
      data: {
        expectedImpact$: 8000,
        artifacts: ['podcast', 'youtube', 'shorts'],
        channels: ['LinkedIn', 'Email'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'brief-agent',
      name: 'Brief Agent',
      category: 'Content',
      description: 'Generate persona-stage brief',
      icon: 'FileText',
    },
    async () => ({
      ok: true,
      summary: 'Brief for CFO @ Proposal created.',
      data: {
        outline: ['Problem', 'Offer', 'Proof', 'CTA'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'distribution-agent',
      name: 'Distribution Agent',
      category: 'Content',
      description: 'Channel copy + UTM + schedule',
      icon: 'Send',
    },
    async () => ({
      ok: true,
      summary: 'Scheduled LI + X with UTM.',
      data: {
        utm: 'utm_source=li&utm_campaign=revos',
        scheduledAt: new Date().toISOString(),
      },
    }),
  ),
)
register(
  make(
    {
      key: 'attribution-agent',
      name: 'Attribution Agent',
      category: 'Content',
      description: 'Assign influenced/advanced/closed',
      icon: 'Target',
    },
    async () => ({
      ok: true,
      summary: 'Attributed $6k influenced; $2k closed.',
      data: {
        influenced$: 6000,
        closedWon$: 2000,
      },
    }),
  ),
)

// Clients
register(
  make(
    {
      key: 'account-intel',
      name: 'Account Intelligence',
      category: 'Clients',
      description: 'Stakeholders, goals, health',
      icon: 'IdCard',
      autoRunnable: true,
    },
    async () => ({
      ok: true,
      summary: 'Health: 72 (green); 2 risks flagged.',
      data: {
        health: 72,
        risks: ['Champion bandwidth', 'Security review'],
      },
    }),
  ),
)
register(
  make(
    {
      key: 'close-plan',
      name: 'Close Plan',
      category: 'Clients',
      description: 'Mutual action plan',
      icon: 'Handshake',
    },
    async () => ({
      ok: true,
      summary: 'Next step set for 10/12.',
      data: {
        nextStep: 'Security review call',
        due: '2025-10-12',
      },
    }),
  ),
)
register(
  make(
    {
      key: 'commercials',
      name: 'Commercials',
      category: 'Clients',
      description: 'Price/terms guardrails',
      icon: 'Scale',
    },
    async () => ({
      ok: true,
      summary: 'Price floor approved; Net30 → Net15.',
      data: {
        priceFloor: '-12%',
        terms: 'Net15',
        expectedImpact$: 3500,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'collections',
      name: 'Collections',
      category: 'Clients',
      description: 'Dunning & recovery',
      icon: 'CreditCard',
    },
    async () => ({
      ok: true,
      summary: 'Dunning step 2 sent; $1.8k likely.',
      data: {
        dollarsAdvanced$: 1800,
      },
    }),
  ),
)
register(
  make(
    {
      key: 'client-health',
      name: 'Client Health',
      category: 'Clients',
      description: 'Adoption & renewal risk',
      icon: 'HeartPulse',
    },
    async () => ({
      ok: true,
      summary: 'Renewal risk low; expansion candidate.',
      data: {
        renewalRisk: 'Low',
        expansionSignal: true,
      },
    }),
  ),
)
