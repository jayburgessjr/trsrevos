export type PartnerStage =
  | "Initial Outreach"
  | "Discovery"
  | "Pilot Collaboration"
  | "Contracting"
  | "Launch"
  | "Dormant";

export type PartnerModel = "Referral Exchange" | "Co-Marketing" | "Co-Sell" | "Community";

export type PartnerContact = {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type PartnerOpportunity = {
  id: string;
  name: string;
  type: "Referral" | "Joint Project" | "Event";
  value: number;
  status: "Sourcing" | "Introduced" | "In Motion" | "Won" | "Stalled";
  targetClient: string;
  expectedClose: string;
};

export type PartnerInitiative = {
  id: string;
  title: string;
  owner: string;
  status: "Planning" | "Active" | "Completed";
  dueDate: string;
  description: string;
};

export type PartnerInteraction = {
  id: string;
  date: string;
  type: "Call" | "Meeting" | "Intro" | "Event" | "Email";
  summary: string;
  nextStep?: string;
  sentiment: "Positive" | "Neutral" | "Caution";
};

export type PartnerResource = {
  id: string;
  title: string;
  type: "Deck" | "One-Pager" | "Case Study" | "Checklist" | "Playbook";
  url: string;
  notes?: string;
};

export type Partner = {
  id: string;
  name: string;
  organizationType: string;
  focus: string;
  city: string;
  state: string;
  stage: PartnerStage;
  owner: string;
  model: PartnerModel;
  potentialValue: number;
  warmIntroductions: number;
  mutualClients: number;
  readinessScore: number;
  notes: string[];
  website?: string;
  lastInteraction: string;
  ecosystemFit: "Anchor" | "Strategic" | "Emerging";
  strengths: string[];
  needs: string[];
  contacts: PartnerContact[];
  opportunities: PartnerOpportunity[];
  initiatives: PartnerInitiative[];
  interactions: PartnerInteraction[];
  resources: PartnerResource[];
};
