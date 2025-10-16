import type {
  Agent,
  AutomationLog,
  ContentItem,
  Document,
  InvoiceSummary,
  Project,
  Resource,
} from './types'

const now = new Date()
const iso = (offsetDays: number) => {
  const date = new Date(now)
  date.setDate(now.getDate() + offsetDays)
  return date.toISOString()
}

export const mockProjects: Project[] = [
  {
    id: 'proj-trs-001',
    name: 'Clarity Audit – Aster Labs',
    client: 'Aster Labs',
    type: 'Audit',
    team: ['Morgan Lee', 'Priya Shah'],
    startDate: iso(-21),
    endDate: iso(7),
    status: 'Active',
    quickbooksInvoiceUrl: 'https://quickbooks.intuit.com/invoice/aster-labs-clarity',
    documents: ['doc-trs-clarity-summary', 'doc-trs-gap-map'],
    agents: [],
    resources: ['res-gap-map', 'res-trs-score'],
    revenueTarget: 32000,
  },
  {
    id: 'proj-trs-002',
    name: 'Revenue Blueprint – Nimbus Security',
    client: 'Nimbus Security',
    type: 'Blueprint',
    team: ['Morgan Lee', 'Derrick Hsu', 'Sasha Ortiz'],
    startDate: iso(-45),
    endDate: iso(-3),
    status: 'Delivered',
    quickbooksInvoiceUrl: 'https://quickbooks.intuit.com/invoice/nimbus-blueprint',
    documents: ['doc-trs-blueprint'],
    agents: [],
    resources: ['res-trs-score', 'res-qra'],
    revenueTarget: 54000,
  },
  {
    id: 'proj-trs-003',
    name: 'Growth Advisory – Northwind Renewables',
    client: 'Northwind Renewables',
    type: 'Advisory',
    team: ['Priya Shah'],
    startDate: iso(-10),
    endDate: iso(30),
    status: 'Pending',
    quickbooksInvoiceUrl: 'https://quickbooks.intuit.com/invoice/northwind-advisory',
    documents: [],
    agents: [],
    resources: ['res-calculator'],
    revenueTarget: 41000,
  },
]

export const mockDocuments: Document[] = [
  {
    id: 'doc-trs-clarity-summary',
    title: 'Clarity Audit Findings',
    description: 'Executive summary of the audit across demand, conversion, and retention.',
    projectId: 'proj-trs-001',
    version: 3,
    type: 'Audit Report',
    status: 'In Review',
    tags: ['Clarity', 'Executive'],
    fileUrl: 'https://storage.trs.dev/docs/clarity-summary-v3.pdf',
    summary:
      'Highlights the three systemic gaps across revenue motions, with quantified impact and prioritized interventions.',
    updatedAt: iso(-1),
  },
  {
    id: 'doc-trs-gap-map',
    title: 'Gap Map – Aster Labs',
    description: 'Visual map of funnel inefficiencies and operational blockers.',
    projectId: 'proj-trs-001',
    version: 2,
    type: 'Intervention Blueprint',
    status: 'Draft',
    tags: ['Gap Map', 'Blueprint'],
    fileUrl: 'https://storage.trs.dev/docs/gap-map-aster-labs.pdf',
    summary: 'Pinpoints automation gaps and handoff friction delaying activation and upsell motions.',
    updatedAt: iso(-4),
  },
  {
    id: 'doc-trs-blueprint',
    title: 'Revenue Blueprint – Nimbus Security',
    description: 'Four-quarter plan to operationalize the monetization strategy.',
    projectId: 'proj-trs-002',
    version: 1,
    type: 'Blueprint',
    status: 'Final',
    tags: ['Blueprint', 'Strategic'],
    fileUrl: 'https://storage.trs.dev/docs/nimbus-blueprint.pdf',
    summary: 'Finalized roadmap including automation backlog, enablement cadence, and forecast controls.',
    updatedAt: iso(-6),
  },
]

export const mockAgents: Agent[] = [
  {
    id: 'agent-clarity-bot',
    name: 'ClarityBot',
    category: 'Communication',
    description: 'Automate Revenue Clarity Audit: gap map, readiness score, and dollarized opportunities.',
    prompt:
      'You are ClarityBot, a Senior Revenue Systems Analyst at TRS. Synthesize client data into executive diagnostics: (1) Executive Summary, (2) Gap Map, (3) Readiness Score, (4) Data Quality Review, (5) Dollarized Opportunities. Tone: precise, financial, systems-oriented. All findings map to TRS RevenueOS framework.',
    defaultOutputType: 'Document',
  },
  {
    id: 'agent-blueprint-engine',
    name: 'BlueprintEngine',
    category: 'Communication',
    description: 'Converts ClarityBot JSON into client-ready deck and internal brief.',
    prompt:
      'You are BlueprintEngine. Given a ClarityBot JSON, produce a 10–12 slide outline and a 1-page prep brief. No new analysis—summarize, visualize, and sequence actions.',
    defaultOutputType: 'Document',
  },
  {
    id: 'agent-offer-desk',
    name: 'OfferDesk',
    category: 'Communication',
    description: 'Turns audit levers into recommended offer path with ROI math.',
    prompt:
      'You are OfferDesk. Convert ClarityBot findings into a single recommended offer. Never show a menu—pick the best path. Include ROI math and fallback option.',
    defaultOutputType: 'Document',
  },
  {
    id: 'agent-data-gate',
    name: 'DataGate',
    category: 'Communication',
    description: 'Validates uploaded files and flags data quality issues before ClarityBot runs.',
    prompt:
      'You are DataGate. Check uploaded files for schema compliance, missing columns, date ranges, and ID mismatches. Flag issues early with actionable fixes.',
    defaultOutputType: 'Document',
  },
  {
    id: 'agent-qra-forecaster',
    name: 'QRA Forecaster',
    category: 'Communication',
    description: 'Projects 12-month ROI bands from levers (best/base/worst scenarios).',
    prompt:
      'You are QRA Forecaster. Project 12-month ROI scenarios (best/base/worst) from ClarityBot levers. Include payback period and confidence bands.',
    defaultOutputType: 'Document',
  },
  {
    id: 'agent-revos-orchestrator',
    name: 'RevOS Orchestrator',
    category: 'Communication',
    description: 'Converts selected offer into sprint backlog with tasks, owners, and deadlines.',
    prompt:
      'You are RevOS Orchestrator. Convert closed deals into implementation backlogs with tasks, owners, deadlines, and milestones. Ready for Linear/ClickUp.',
    defaultOutputType: 'Document',
  },
]

export const mockContent: ContentItem[] = [
  {
    id: 'content-case-aster',
    title: 'Case Study: Aster Labs Conversion Lift',
    type: 'Case Study',
    sourceProjectId: 'proj-trs-001',
    draft:
      'Aster Labs partnered with TRS to uncover automation gaps. Within six weeks, conversion rates climbed 18%.',
    finalText:
      'Aster Labs realized an 18% conversion lift by implementing the TRS Gap Map interventions across activation and upsell streams.',
    status: 'Published',
    createdAt: iso(-2),
  },
  {
    id: 'content-email-nimbus',
    title: 'Nimbus Blueprint Launch Email',
    type: 'Email',
    sourceProjectId: 'proj-trs-002',
    draft: 'Draft email announcing the blueprint completion and sharing the QuickBooks invoice link.',
    status: 'Draft',
    createdAt: iso(-5),
  },
]

export const mockResources: Resource[] = [
  {
    id: 'res-gap-map',
    name: 'Gap Map Template',
    description: 'Canvas for mapping friction by motion and owner.',
    type: 'File',
    link: 'https://storage.trs.dev/resources/gap-map-template.xlsx',
    tags: ['Gap Map', 'Template'],
    relatedProjectIds: ['proj-trs-001'],
  },
  {
    id: 'res-trs-score',
    name: 'TRS Score Guide',
    description: 'Reference guide for scoring revenue foundations.',
    type: 'Link',
    link: 'https://trs.rev/scoring-guide',
    tags: ['TRS Score', 'Guide'],
    relatedProjectIds: ['proj-trs-001', 'proj-trs-002'],
  },
  {
    id: 'res-qra',
    name: 'Quarterly Revenue Architecture',
    description: 'Modular architecture for revenue programs.',
    type: 'File',
    link: 'https://storage.trs.dev/resources/qra-framework.pdf',
    tags: ['Architecture', 'Framework'],
    relatedProjectIds: ['proj-trs-002'],
  },
  {
    id: 'res-calculator',
    name: 'Capacity Calculator',
    description: 'Scenario modeling for advisory retainers.',
    type: 'File',
    link: 'https://storage.trs.dev/resources/capacity-calculator.xlsx',
    tags: ['Calculator'],
    relatedProjectIds: ['proj-trs-003'],
  },
]

export const mockAutomationLogs: AutomationLog[] = []

export const mockInvoices: InvoiceSummary[] = [
  {
    id: 'inv-aster-001',
    projectId: 'proj-trs-001',
    amount: 32000,
    status: 'Sent',
    dueDate: iso(10),
  },
  {
    id: 'inv-nimbus-001',
    projectId: 'proj-trs-002',
    amount: 54000,
    status: 'Paid',
    dueDate: iso(-14),
    paidDate: iso(-12),
  },
  {
    id: 'inv-northwind-001',
    projectId: 'proj-trs-003',
    amount: 41000,
    status: 'Draft',
    dueDate: iso(30),
  },
]
