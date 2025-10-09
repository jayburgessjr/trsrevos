export type RevOSPhase = "Discovery" | "Data" | "Algorithm" | "Architecture" | "Compounding";
export type RevosPhase = RevOSPhase;

export type Contact = {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  power?: "User" | "Influencer" | "Decision" | "Economic";
};

export type Commercials = {
  plan: string;
  price: number;
  termMonths: number;
  discountPct: number;
  renewalDate?: string;
  paymentTerms?: string;
  approvals?: string[];
};

export type Invoice = {
  id: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  dueAt?: string;
  sentAt?: string;
  paidAt?: string;
};

export type Opportunity = {
  id: string;
  name: string;
  amount: number;
  stage:
    | "New"
    | "Qualify"
    | "Proposal"
    | "Negotiation"
    | "ClosedWon"
    | "ClosedLost";
  nextStep?: string;
  nextStepDate?: string;
  probability?: number;
};

export type DiscoveryQA = {
  id: string;
  question: string;
  answer?: string;
  lever?: string;
  expectedImpact?: number;
};

export type DataSource = {
  id: string;
  name: string;
  category: string;
  status: "Available" | "Collected" | "Missing";
  notes?: string;
};

export type QRAStrategy = {
  pricing: string[];
  offers: string[];
  retention: string[];
  partners: string[];
  expectedImpact: number;
};

export type KanbanItem = {
  id: string;
  title: string;
  status: "Backlog" | "Doing" | "Blocked" | "Review" | "Done";
  owner?: string;
  due?: string;
};

export type CompoundingMetrics = {
  baselineMRR: number;
  currentMRR: number;
  netNew: number;
  forecastQTD: number;
  drivers: { name: string; delta: number }[];
};

export type Client = {
  id: string;
  name: string;
  segment: "SMB" | "Mid" | "Enterprise";
  arr?: number;
  industry?: string;
  region?: string;
  phase: RevOSPhase;
  owner: string;
  health: number;
  contacts: Contact[];
  commercials?: Commercials;
  invoices: Invoice[];
  opportunities: Opportunity[];
  discovery: DiscoveryQA[];
  data: DataSource[];
  qra?: QRAStrategy;
  kanban: KanbanItem[];
  compounding?: CompoundingMetrics;
  notes?: string;
};
