import { Client, RevOSPhase, DiscoveryQA, DataSource, KanbanItem } from "./types";

const CLIENTS = new Map<string, Client>();

// Seed a couple of clients for demo
(function seed() {
  const id = "acme";
  if (!CLIENTS.has(id)) {
    CLIENTS.set(id, {
      id,
      name: "ACME Industries",
      segment: "Mid",
      arr: 240000,
      industry: "Manufacturing",
      region: "NA",
      phase: "Discovery",
      owner: "Jay",
      health: 72,
      churnRisk: 14,
      qbrDate: "2025-10-22",
      status: "active",
      isExpansion: true,
      contacts: [
        {
          id: "c1",
          name: "Dana Lee",
          role: "CFO",
          email: "dana@acme.com",
          power: "Economic",
        },
        {
          id: "c2",
          name: "Sam Rivera",
          role: "COO",
          email: "sam@acme.com",
          power: "Decision",
        },
      ],
      commercials: { plan: "Plus", price: 1200, termMonths: 12, discountPct: 8, paymentTerms: "Net30" },
      invoices: [{ id: "inv-882", amount: 3500, status: "Sent", dueAt: "2025-10-20", sentAt: "2025-10-05" }],
      opportunities: [
        {
          id: "opp-1",
          name: "RevOS rollout",
          amount: 48000,
          stage: "Proposal",
          nextStep: "Security review",
          nextStepDate: "2025-10-12",
          probability: 0.55,
        },
      ],
      discovery: [
        {
          id: "q1",
          question: "Primary revenue constraint?",
          answer: "Pricing clarity",
          lever: "Raise Plus by 5%",
          expectedImpact: 4000,
        },
        { id: "q2", question: "Buying committee roles identified?" },
      ],
      data: [
        { id: "d1", name: "Stripe", category: "Billing", status: "Available" },
        { id: "d2", name: "CRM Deals", category: "Sales", status: "Collected" },
        { id: "d3", name: "Churn reasons", category: "CS", status: "Missing" },
      ],
      qra: {
        pricing: ["Meter usage uplift", "Volume guardrails"],
        offers: ["Founder bundle"],
        retention: ["Quarterly business review"],
        partners: ["GrowthOps"],
        expectedImpact: 6200,
      },
      kanban: [
        { id: "k1", title: "Auth SSO guardrail", status: "Doing", owner: "TRS" },
        { id: "k2", title: "Pricing floor rules", status: "Backlog" },
        { id: "k3", title: "Invoice dunning v2", status: "Review" },
      ],
      compounding: {
        baselineMRR: 18000,
        currentMRR: 19500,
        netNew: 1500,
        forecastQTD: 4800,
        drivers: [
          { name: "Price uplift", delta: 700 },
          { name: "Collections", delta: 500 },
        ],
      },
      notes: "Security questionnaire pending.",
    });
  }

  const id2 = "globex";
  if (!CLIENTS.has(id2)) {
    CLIENTS.set(id2, {
      id: id2,
      name: "Globex Retail",
      segment: "Enterprise",
      arr: 520000,
      industry: "Retail",
      region: "EMEA",
      phase: "Algorithm",
      owner: "Morgan",
      health: 64,
      churnRisk: 18,
      qbrDate: "2025-11-05",
      status: "active",
      isExpansion: false,
      contacts: [
        { id: "g1", name: "Priya Nair", role: "VP Revenue", email: "priya@globex.com", power: "Decision" },
        { id: "g2", name: "Jordan Chu", role: "Head of Data", email: "jordan@globex.com", power: "Influencer" },
      ],
      commercials: {
        plan: "Enterprise",
        price: 3400,
        termMonths: 24,
        discountPct: 12,
        paymentTerms: "Net45",
        approvals: ["Finance", "Security"],
      },
      invoices: [
        { id: "inv-993", amount: 6800, status: "Overdue", dueAt: "2025-09-30", sentAt: "2025-09-15" },
        { id: "inv-1002", amount: 6800, status: "Draft" },
      ],
      opportunities: [
        {
          id: "opp-22",
          name: "RevOS renewal",
          amount: 81600,
          stage: "Negotiation",
          nextStep: "Legal redlines",
          nextStepDate: "2025-10-18",
          probability: 0.45,
        },
        { id: "opp-23", name: "Pilot expansion", amount: 42000, stage: "Qualify" },
      ],
      discovery: [
        { id: "gq1", question: "Merchandising blocker?", answer: "Need dynamic offers" },
        { id: "gq2", question: "Executive sponsor?", answer: "Priya confirmed" },
      ],
      data: [
        { id: "gd1", name: "NetSuite", category: "ERP", status: "Collected" },
        { id: "gd2", name: "Segment", category: "Product", status: "Available" },
        { id: "gd3", name: "Churn survey", category: "CS", status: "Missing" },
      ],
      qra: {
        pricing: ["Bundle loyalty tiers", "Seasonal price tests"],
        offers: ["Preferred partner promos"],
        retention: ["VIP cohort management"],
        partners: ["Field Ops"],
        expectedImpact: 9200,
      },
      kanban: [
        { id: "gk1", title: "Offer personalization engine", status: "Backlog", owner: "Globex" },
        { id: "gk2", title: "Data contract refresh", status: "Blocked", owner: "Morgan" },
      ],
      compounding: {
        baselineMRR: 42000,
        currentMRR: 43800,
        netNew: 1800,
        forecastQTD: 9600,
        drivers: [
          { name: "Offer testing", delta: 900 },
          { name: "Churn mitigation", delta: 600 },
        ],
      },
    });
  }

  const id3 = "helio";
  if (!CLIENTS.has(id3)) {
    CLIENTS.set(id3, {
      id: id3,
      name: "Helio Systems",
      segment: "Mid",
      arr: 180000,
      industry: "Energy",
      region: "NA",
      phase: "Architecture",
      owner: "Taylor",
      health: 82,
      churnRisk: 9,
      qbrDate: "2025-10-15",
      status: "active",
      isExpansion: true,
      contacts: [
        { id: "h1", name: "Alex Park", role: "Head of RevOps", email: "alex@helio.io", power: "Decision" },
      ],
      commercials: { plan: "Plus", price: 1500, termMonths: 12, discountPct: 5, paymentTerms: "Net30" },
      invoices: [
        { id: "inv-2001", amount: 4500, status: "Paid", paidAt: "2025-09-05" },
      ],
      opportunities: [
        { id: "hopp-1", name: "Expansion package", amount: 36000, stage: "Proposal", probability: 0.6 },
      ],
      discovery: [
        { id: "hq1", question: "Primary growth lever?", answer: "Usage automation" },
      ],
      data: [
        { id: "hd1", name: "Billing", category: "Finance", status: "Collected" },
        { id: "hd2", name: "NPS", category: "CS", status: "Available" },
      ],
      qra: {
        pricing: ["Rollout peak pricing"],
        offers: ["Solar bundle"],
        retention: ["Executive business review"],
        partners: ["Field Ops"],
        expectedImpact: 5400,
      },
      kanban: [
        { id: "hk1", title: "Usage anomaly alerts", status: "Doing", owner: "Taylor" },
      ],
      compounding: {
        baselineMRR: 15000,
        currentMRR: 16200,
        netNew: 1200,
        forecastQTD: 4200,
        drivers: [{ name: "Automation add-on", delta: 600 }],
      },
      notes: "Architecture blueprint approved for rollout.",
    });
  }

  const id4 = "northwave";
  if (!CLIENTS.has(id4)) {
    CLIENTS.set(id4, {
      id: id4,
      name: "Northwave Analytics",
      segment: "SMB",
      arr: 96000,
      industry: "SaaS",
      region: "NA",
      phase: "Compounding",
      owner: "Riley",
      health: 58,
      churnRisk: 22,
      qbrDate: "2025-09-28",
      status: "churned",
      isExpansion: false,
      contacts: [
        { id: "n1", name: "Jamie Cole", role: "Founder", email: "jamie@northwave.ai", power: "Economic" },
      ],
      commercials: { plan: "Starter", price: 800, termMonths: 6, discountPct: 0, paymentTerms: "Net15" },
      invoices: [
        { id: "inv-3001", amount: 2400, status: "Overdue", dueAt: "2025-09-10" },
      ],
      opportunities: [
        { id: "nopp-1", name: "Renewal", amount: 12000, stage: "Negotiation", probability: 0.3 },
      ],
      discovery: [
        { id: "nq1", question: "Primary blocker?", answer: "Data trust" },
      ],
      data: [
        { id: "nd1", name: "Product usage", category: "Product", status: "Missing" },
        { id: "nd2", name: "Billing", category: "Finance", status: "Collected" },
      ],
      qra: {
        pricing: ["Stabilize annual plan"],
        offers: ["Onboarding reset"],
        retention: ["Weekly office hours"],
        partners: ["Success"],
        expectedImpact: 2200,
      },
      kanban: [
        { id: "nk1", title: "Data trust remediation", status: "Blocked" },
        { id: "nk2", title: "Renewal playbook", status: "Backlog" },
      ],
      compounding: {
        baselineMRR: 8000,
        currentMRR: 7800,
        netNew: -200,
        forecastQTD: 600,
        drivers: [{ name: "Churn risk", delta: -300 }],
      },
      notes: "Renewal slipping due to data delays.",
    });
  }
})();

export function listClients(): Client[] {
  return Array.from(CLIENTS.values());
}

export function getClients(): Client[] {
  return listClients();
}

export function getClientStats() {
  const clients = getClients();
  const total = clients.length || 1;
  const avgHealth = Math.round(
    clients.reduce((sum, client) => sum + (client.health ?? 0), 0) / total,
  );
  const atRisk = clients.filter((client) => (client.churnRisk ?? 0) >= 15).length;
  const expansions = clients.filter((client) => client.isExpansion).length;
  const churned = clients.filter((client) => client.status === "churned").length;

  return { avgHealth, atRisk, expansions, churned };
}
export function getClient(id: string): Client | null {
  return CLIENTS.get(id) ?? null;
}
export function upsertClient(c: Client) {
  CLIENTS.set(c.id, c);
  return c;
}

export function setPhase(id: string, phase: RevOSPhase) {
  const c = CLIENTS.get(id);
  if (!c) return null;
  c.phase = phase;
  CLIENTS.set(id, c);
  return c;
}
export function saveDiscovery(id: string, qa: DiscoveryQA[]) {
  const c = CLIENTS.get(id);
  if (!c) return null;
  c.discovery = qa;
  CLIENTS.set(id, c);
  return c;
}
export function saveDataSources(id: string, data: DataSource[]) {
  const c = CLIENTS.get(id);
  if (!c) return null;
  c.data = data;
  CLIENTS.set(id, c);
  return c;
}
export function saveKanban(id: string, cards: KanbanItem[]) {
  const c = CLIENTS.get(id);
  if (!c) return null;
  c.kanban = cards;
  CLIENTS.set(id, c);
  return c;
}
