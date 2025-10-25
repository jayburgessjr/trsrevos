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

export type DealType = "invoiced" | "equity_partnership" | "equity";

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
  churnRisk?: number;
  qbrDate?: string;
  status?: "active" | "churned";
  isExpansion?: boolean;
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
  // Financial tracking
  dealType?: DealType;
  monthlyInvoiced?: number; // For invoiced deals: monthly amount we invoice
  equityPercentage?: number; // For equity deals: our equity stake (typically 15%)
  // For equity_partnership: $2500/mo + 2% of client MRR (calculated from compounding.currentMRR)
};

export type DiscoveryResponse = {
  id: string;
  client_id: string;
  form_type: "gap_selling" | "clarity_gap" | "revenue_research" | string;
  answers: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DataRequirementStatus = "needed" | "in_progress" | "collected";

export type DataRequirement = {
  id: string;
  client_id: string;
  source_name: string;
  required: boolean;
  status: DataRequirementStatus;
  notes: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ClientStrategyStatus = "active" | "archived";

export type ClientStrategy = {
  id: string;
  client_id: string;
  title: string;
  key: string | null;
  body: Record<string, unknown>;
  status: ClientStrategyStatus;
  created_at: string;
};

export type QRARun = {
  id: string;
  client_id: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  selected_strategy_key: string | null;
  created_by: string | null;
  created_at: string;
};

export type ActivityItemType = "event" | "email" | "meeting" | "note";

export type ActivityItem = {
  id: string;
  type: ActivityItemType;
  occurred_at: string | null;
  title: string;
  details?: Record<string, unknown>;
};

export type ClientDeliverable = {
  id: string;
  client_id: string;
  name?: string;
  title?: string;
  type: string | null;
  link?: string | null;
  url?: string | null;
  status?: string | null;
  share_expires_at?: string | null;
  meta?: Record<string, unknown> | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ClientFinancialSnapshot = {
  id: string;
  client_id: string;
  equity_stake: number | null;
  monthly_revenue: number | null;
  projected_annual_revenue: number | null;
  last_updated: string | null;
  created_at?: string | null;
};
