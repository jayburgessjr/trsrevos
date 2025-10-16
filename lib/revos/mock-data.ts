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
    agents: ['agent-clarity-summarizer', 'agent-follow-up'],
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
    agents: ['agent-blueprint-generator'],
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
    agents: ['agent-follow-up'],
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
    id: 'agent-clarity-summarizer',
    name: 'Clarity Audit Summarizer',
    category: 'Summarization',
    description: 'Distills uploaded audit documents into executive-ready talking points.',
    prompt:
      'Summarize the latest Clarity Audit deliverables into three crisp insights and the recommended interventions.',
    defaultOutputType: 'Document',
  },
  {
    id: 'agent-blueprint-generator',
    name: 'Revenue Blueprint Generator',
    category: 'Reporting',
    description: 'Transforms validated interventions into a blueprint deck outline.',
    prompt:
      'Translate prioritized interventions and playbooks into a quarter-by-quarter execution plan.',
    defaultOutputType: 'Content',
  },
  {
    id: 'agent-follow-up',
    name: 'Client Follow-Up Composer',
    category: 'Communication',
    description: 'Drafts next-step follow-ups to keep revenue interventions on track.',
    prompt: 'Draft a follow-up email summarizing key outcomes and next actions for the project sponsor.',
    defaultOutputType: 'Content',
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

export const mockAutomationLogs: AutomationLog[] = [
  {
    id: 'auto-log-001',
    agentId: 'agent-clarity-summarizer',
    projectId: 'proj-trs-001',
    outputType: 'Document',
    summary: 'Generated executive summary v3 for Clarity Audit.',
    createdAt: iso(-1),
  },
  {
    id: 'auto-log-002',
    agentId: 'agent-blueprint-generator',
    projectId: 'proj-trs-002',
    outputType: 'Content',
    summary: 'Drafted blueprint launch email for Nimbus Security.',
    createdAt: iso(-5),
  },
]

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
