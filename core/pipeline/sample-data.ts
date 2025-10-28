import type { OpportunityWithNotes, OpportunityNote } from "./actions";

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function note(
  id: string,
  opportunityId: string,
  authorId: string,
  body: string,
  daysOffset: number,
): OpportunityNote {
  return {
    id,
    opportunity_id: opportunityId,
    author_id: authorId,
    body,
    created_at: daysAgo(daysOffset),
  };
}

const SAMPLE_OPPORTUNITIES: OpportunityWithNotes[] = [
  {
    id: "sample-prospect-atlas",
    client_id: "sample-client-atlas",
    name: "Atlas Labs – RevOS Pilot",
    amount: 85000,
    stage: "Prospect",
    probability: 10,
    close_date: null,
    owner_id: "owner-jordan",
    next_step: "Intro call with CTO",
    next_step_date: daysFromNow(5),
    created_at: daysAgo(42),
    updated_at: daysAgo(2),
    notes: [
      note(
        "sample-note-atlas-1",
        "sample-prospect-atlas",
        "owner-jordan",
        "CTO responded positively to automation narrative.",
        3,
      ),
    ],
    client: { name: "Atlas Labs" },
    owner: { name: "Jordan Lee" },
  },
  {
    id: "sample-qualify-northwind",
    client_id: "sample-client-northwind",
    name: "Northwind Analytics – GTM Revamp",
    amount: 125000,
    stage: "Qualify",
    probability: 25,
    close_date: null,
    owner_id: "owner-ashley",
    next_step: "Scope revenue intelligence workshop",
    next_step_date: daysFromNow(3),
    created_at: daysAgo(58),
    updated_at: daysAgo(5),
    notes: [
      note(
        "sample-note-northwind-1",
        "sample-qualify-northwind",
        "owner-ashley",
        "Need security questionnaire signed before sharing pipeline.",
        6,
      ),
    ],
    client: { name: "Northwind Analytics" },
    owner: { name: "Ashley Morgan" },
  },
  {
    id: "sample-proposal-aurora",
    client_id: "sample-client-aurora",
    name: "Aurora Bio – Commercial Launch",
    amount: 178000,
    stage: "Proposal",
    probability: 50,
    close_date: null,
    owner_id: "owner-jordan",
    next_step: "Send executive enablement plan",
    next_step_date: daysFromNow(2),
    created_at: daysAgo(36),
    updated_at: daysAgo(4),
    notes: [
      note(
        "sample-note-aurora-1",
        "sample-proposal-aurora",
        "owner-jordan",
        "Finance requested revised payment schedule.",
        2,
      ),
    ],
    client: { name: "Aurora Bio" },
    owner: { name: "Jordan Lee" },
  },
  {
    id: "sample-negotiation-lumen",
    client_id: "sample-client-lumen",
    name: "Lumen Cloud – Strategic Partnership",
    amount: 96000,
    stage: "Negotiation",
    probability: 75,
    close_date: null,
    owner_id: "owner-samira",
    next_step: "Legal review of MSA",
    next_step_date: daysFromNow(1),
    created_at: daysAgo(48),
    updated_at: daysAgo(1),
    notes: [
      note(
        "sample-note-lumen-1",
        "sample-negotiation-lumen",
        "owner-samira",
        "Need CFO approval on revised pricing tier.",
        1,
      ),
    ],
    client: { name: "Lumen Cloud" },
    owner: { name: "Samira Patel" },
  },
  {
    id: "sample-closedwon-horizon",
    client_id: "sample-client-horizon",
    name: "Horizon Freight – Automation Rollout",
    amount: 210000,
    stage: "ClosedWon",
    probability: 100,
    close_date: daysAgo(10),
    owner_id: "owner-ashley",
    next_step: "Kickoff implementation squad",
    next_step_date: daysFromNow(7),
    created_at: daysAgo(92),
    updated_at: daysAgo(10),
    notes: [
      note(
        "sample-note-horizon-1",
        "sample-closedwon-horizon",
        "owner-ashley",
        "Closed with expanded success plan and QBR cadence.",
        9,
      ),
    ],
    client: { name: "Horizon Freight" },
    owner: { name: "Ashley Morgan" },
  },
  {
    id: "sample-closedlost-pioneer",
    client_id: "sample-client-pioneer",
    name: "Pioneer Robotics – Field Ops Retrofit",
    amount: 55000,
    stage: "ClosedLost",
    probability: 0,
    close_date: daysAgo(21),
    owner_id: "owner-samira",
    next_step: null,
    next_step_date: null,
    created_at: daysAgo(80),
    updated_at: daysAgo(21),
    notes: [
      note(
        "sample-note-pioneer-1",
        "sample-closedlost-pioneer",
        "owner-samira",
        "Lost to incumbent due to integration timeline concerns.",
        20,
      ),
    ],
    client: { name: "Pioneer Robotics" },
    owner: { name: "Samira Patel" },
  },
];

function cloneOpportunity(opportunity: OpportunityWithNotes): OpportunityWithNotes {
  return {
    ...opportunity,
    notes: opportunity.notes.map((entry) => ({ ...entry })),
    client: opportunity.client ? { ...opportunity.client } : null,
    owner: opportunity.owner ? { ...opportunity.owner } : null,
  };
}

export function getSampleOpportunities(): OpportunityWithNotes[] {
  return SAMPLE_OPPORTUNITIES.map(cloneOpportunity);
}
