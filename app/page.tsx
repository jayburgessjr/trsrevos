'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Download,
  FileText,
  Layers,
  LineChart,
  Mail,
  Rocket,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

/**
 * TRS Copilot — TypeScript + React scaffold
 * - Single-file preview scaffold showing layout, nav, KPIs, module shells, and core types.
 * - Production app would split into /app routes and components. This keeps it previewable in one file.
 * - Styling uses Tailwind (no import required in canvas). shadcn/ui components assumed available.
 */

// ---------- Domain Types (minimal, extensible) ----------
export type Id = string;

export type Account = {
  id: Id;
  name: string;
  segment: "SMB" | "MM" | "ENT";
  acvBand: "<10k" | "10-50k" | ">50k";
  ownerId?: Id;
};

export type Contact = {
  id: Id;
  accountId: Id;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

export type Opportunity = {
  id: Id;
  accountId: Id;
  name: string;
  stage:
    | "New"
    | "Discovery"
    | "Proposal"
    | "Negotiation"
    | "Closed Won"
    | "Closed Lost";
  amount: number;
  closeDate?: string; // ISO
  source?: string;
  probability?: number; // 0..1
};

export type Offer = {
  id: Id;
  name: string;
  priceMetric: "seat" | "usage" | "flat";
  basePrice: number;
  floor: number;
  ceiling: number;
};

export type Contract = {
  id: Id;
  accountId: Id;
  arr: number;
  startAt: string;
  endAt: string;
  terms?: string;
};

export type Invoice = {
  id: Id;
  contractId: Id;
  amount: number;
  dueAt: string;
  paidAt?: string;
  status: "pending" | "paid" | "failed";
};

export type ActivityEvent = {
  id: Id;
  type: "email" | "call" | "meeting" | "note";
  accountId?: Id;
  contactId?: Id;
  opportunityId?: Id;
  occurredAt: string;
  notes?: string;
};

export type Experiment = {
  id: Id;
  hypothesis: string;
  kpi: string;
  startAt: string;
  endAt?: string;
  status: "draft" | "running" | "stopped" | "won" | "lost";
};

export type DeliverableType =
  | "Clarity Audit"
  | "Gap Map"
  | "Intervention Blueprint"
  | "RevBoard Dashboard"
  | "Monthly ROI Report"
  | "Quarterly ROI Synthesis"
  | "Case Study Packet";

export type Deliverable = {
  id: Id;
  accountId: Id;
  type: DeliverableType;
  status: "not started" | "in progress" | "review" | "approved" | "exported";
  ownerId?: Id;
  dueAt?: string;
  exportLink?: string;
  lastReviewedAt?: string;
};

export type GovernanceAction = {
  id: Id;
  entity: string;
  entityId: Id;
  requirement:
    | "ROI hypothesis"
    | "QA checklist"
    | "Owner"
    | "Payback window"
    | "TRS Score lever";
  status: "open" | "met" | "blocked";
  ownerId?: Id;
  evidenceLink?: string;
  decidedAt?: string;
};

export type ModelCard = {
  id: Id;
  name: string;
  version: string;
  trainingSources: string[];
  metrics: Record<string, number>; // e.g., { F1: 0.78, MAPE: 0.09 }
  thresholds: Record<string, number>; // guardrails
  retrainAt?: string;
  approverId?: Id;
};

export type TRSScoreBand = "Red" | "Yellow" | "Green";

export type TRSScore = {
  accountId: Id;
  score: number; // 0..100
  band: TRSScoreBand;
  computedAt: string;
  drivers: { name: string; delta: number }[];
};

// ---------- Mock Data ----------
const mockScore: TRSScore = {
  accountId: "acct_1",
  score: 68,
  band: "Yellow",
  computedAt: new Date().toISOString(),
  drivers: [
    { name: "NRR", delta: +4 },
    { name: "Gross Margin", delta: +2 },
    { name: "CAC Payback", delta: -3 },
    { name: "Cash Conversion", delta: -1 },
  ],
};

const kpis = [
  { label: "NRR", value: "112%", icon: TrendingUp },
  { label: "Gross Margin", value: "62%", icon: DollarSign },
  { label: "CAC Payback", value: "8.5 mo", icon: BarChart3 },
  { label: "Cash", value: "$1.2M", icon: Wallet },
];

// ---------- UI Helpers ----------
const bandConfig: Record<TRSScoreBand, { color: string; label: string }> = {
  Red: { color: "bg-red-500", label: "Stabilization Plays" },
  Yellow: { color: "bg-yellow-500", label: "Incremental Plays" },
  Green: { color: "bg-green-500", label: "Brilliant Plays" },
};

const modules = [
  { key: "revboard", label: "Executive Room", icon: LineChart },
  { key: "crm", label: "Pipeline Spine", icon: Building2 },
  { key: "agents", label: "Agents", icon: Brain },
  { key: "qra", label: "QRA Strategy", icon: Target },
  { key: "dealdesk", label: "Deal Desk", icon: ClipboardList },
  { key: "fpna", label: "FP&A + Cash", icon: DollarSign },
  { key: "retention", label: "Retention", icon: Users },
  { key: "experiments", label: "Experiments", icon: Activity },
  { key: "partners", label: "Partner Scout", icon: Rocket },
  { key: "content", label: "Content Engine", icon: BookOpen },
  { key: "billing", label: "Billing & RevOps", icon: Wallet },
  { key: "deliverables", label: "Deliverables", icon: FileText },
  { key: "governance", label: "Governance", icon: Shield },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type ModuleKey = (typeof modules)[number]["key"];

// ---------- Core Layout ----------
export default function TRSCopilotScaffold() {
  const [active, setActive] = useState<ModuleKey>("revboard");
  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
      <Header score={mockScore} />
      <div className="flex">
        <Sidebar active={active} onChange={setActive} />
        <main className="flex-1 p-6">
          {active === "revboard" && <ExecutiveRoom />}
          {active === "crm" && <PipelineSpine />}
          {active === "agents" && <AgentsHub />}
          {active === "qra" && <QRASection />}
          {active === "dealdesk" && <DealDesk />}
          {active === "fpna" && <FPnA />}
          {active === "retention" && <Retention />}
          {active === "experiments" && <Experiments />}
          {active === "partners" && <PartnerScout />}
          {active === "content" && <ContentEngine />}
          {active === "billing" && <BillingRevOps />}
          {active === "deliverables" && <DeliverablesPanel />}
          {active === "governance" && <GovernancePanel />}
          {active === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function Header({ score }: { score: TRSScore }) {
  const pct = Math.max(0, Math.min(100, score.score));
  const band = bandConfig[score.band];
  return (
    <div className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6" />
          <span className="font-semibold">TRS Copilot</span>
          <Badge variant="secondary" className="rounded-full">
            Internal
          </Badge>
        </div>
        <div className="ml-auto flex w-full max-w-xl items-center gap-4">
          <div className="w-full">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">TRS Score</span>
              <span className="font-semibold">{pct}</span>
            </div>
            <Progress value={pct} className="h-2" />
            <div className="mt-1 flex items-center justify-between text-xs text-neutral-600">
              <span>{new Date(score.computedAt).toLocaleString()}</span>
              <span className={`inline-flex items-center gap-1`}>
                <span className={`h-2 w-2 rounded-full ${band.color}`} /> {band.label}
              </span>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Deck
          </Button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  active,
  onChange,
}: {
  active: ModuleKey;
  onChange: (m: ModuleKey) => void;
}) {
  return (
    <aside className="sticky top-[64px] h-[calc(100vh-64px)] w-72 shrink-0 border-r bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Search className="h-4 w-4" />
        <Input placeholder="Search accounts, deals…" />
      </div>
      <nav className="space-y-1">
        {modules.map((m) => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
              active === m.key ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
            }`}
          >
            <m.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{m.label}</span>
            {m.key === "deliverables" && (
              <Badge
                className="ml-auto"
                variant={active === m.key ? "secondary" : "outline"}
              >
                3
              </Badge>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-6 rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-600">
        <div className="mb-1 font-semibold text-neutral-800">Master Switches</div>
        <div className="flex items-center justify-between py-1">
          <span>Deal Desk</span>
          <SwitchInline enabled />
        </div>
        <div className="flex items-center justify-between py-1">
          <span>Partner Scout</span>
          <SwitchInline enabled />
        </div>
        <div className="flex items-center justify-between py-1">
          <span>AI Auto-Execute</span>
          <SwitchInline />
        </div>
      </div>
    </aside>
  );
}

function SwitchInline({ enabled = false }: { enabled?: boolean }) {
  const [on, setOn] = useState(enabled);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 rounded-full transition ${
        on ? "bg-neutral-900" : "bg-neutral-300"
      }`}
      aria-label="toggle"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          on ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

// ---------- Executive Room ----------
function ExecutiveRoom() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Executive Room</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-600">{label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{value}</div>
              <Icon className="h-6 w-6" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Top 5 Plays in Motion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Raise list price 8% within floor/ceiling",
            "Freeze lowest-ROI channel",
            "Expansion trigger for Tier A accounts",
            "Dunning for failed payments 7d",
            "Partner launch: Rev-share with MSP Guild",
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <ChevronRight className="h-4 w-4" />
                <span className="text-sm font-medium">{p}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Owner: You</Badge>
                <Badge variant="secondary">In progress</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Risks & Blockers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <RiskRow icon={AlertTriangle} text="Forecast error >10% for 2 cycles" status="Investigating" />
            <RiskRow icon={AlertTriangle} text="Failed payments up 25% (7d MA)" status="Dunning Live" />
            <RiskRow icon={AlertTriangle} text="Discount leakage > guardrail" status="Deal Desk Gate" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Cadence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CadenceRow icon={Calendar} label="Weekly" items={["RevBoard deck", "Signals readout", "Agent stats"]} />
            <CadenceRow icon={Calendar} label="Monthly" items={["ROI report", "Blueprint delta", "TRS Score movement"]} />
            <CadenceRow icon={Calendar} label="Quarterly" items={["ROI synthesis", "CaseCompiler packet"]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RiskRow({ icon: Icon, text, status }: { icon: any; text: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span>{text}</span>
      </div>
      <Badge variant="outline">{status}</Badge>
    </div>
  );
}

function CadenceRow({ icon: Icon, label, items }: { icon: any; label: string; items: string[] }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <Badge key={i} variant="secondary">
            {i}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ---------- Pipeline Spine (Mini-CRM) ----------
function PipelineSpine() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Pipeline Spine</h1>
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox → Revenue</TabsTrigger>
          <TabsTrigger value="deals">Deal Desk</TabsTrigger>
          <TabsTrigger value="renewals">Renewal Radar</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <InboxToRevenue />
        </TabsContent>
        <TabsContent value="deals">
          <DealTable />
        </TabsContent>
        <TabsContent value="renewals">
          <RenewalTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InboxToRevenue() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4" />
              <div>
                <div className="font-medium">Lead {i + 1} • ICP 86</div>
                <div className="text-neutral-600">Problem: Pricing confusion; Request: ROI model</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                Draft Reply
              </Button>
              <Button size="sm">Book</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DealTable() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(["New", "Discovery", "Proposal", "Negotiation"] as const).map((stage) => (
        <Card key={stage} className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{stage}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <div className="font-medium">ACME • $24k</div>
                  <div className="text-neutral-600">
                    Prob: {Math.round(20 + Math.random() * 60)}% • Source: Outbound
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RenewalTable() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Next 90 Days</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Account {i + 1}</span>
              <Badge variant="outline">Risk: {(10 + i) % 3 ? "Low" : "High"}</Badge>
            </div>
            <div className="text-neutral-600">Reason: Low adoption • Play: QBR + expansion offer</div>
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" variant="outline">
                Rescue Plan
              </Button>
              <Button size="sm">Schedule QBR</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Agents Hub ----------
function AgentsHub() {
  const agents = [
    { name: "ICP Prospector", kpi: "Meetings/week", status: "Running", icon: Search },
    { name: "Outreach Copy Chief", kpi: "Reply rate", status: "Paused", icon: Mail },
    { name: "Meeting Orchestrator", kpi: "Show rate", status: "Running", icon: Calendar },
    { name: "Deal Coach", kpi: "Win rate", status: "Running", icon: Target },
    { name: "Pricing Analyst", kpi: "Margin uplift", status: "Running", icon: DollarSign },
    { name: "Churn Rescue", kpi: "Save rate", status: "Running", icon: Shield },
    { name: "Expansion Hunter", kpi: "NRR", status: "Running", icon: TrendingUp },
    { name: "FP&A Copilot", kpi: "Forecast error", status: "Running", icon: BarChart3 },
    { name: "Partner Scout", kpi: "Partner pipeline", status: "Running", icon: Rocket },
    { name: "Authority Writer", kpi: "SQLs from content", status: "Running", icon: BookOpen },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Agents</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {agents.map((a) => (
          <Card key={a.name} className="rounded-2xl">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <a.icon className="h-4 w-4" />
                <CardTitle className="text-base">{a.name}</CardTitle>
              </div>
              <Badge variant="secondary">KPI: {a.kpi}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">Status: {a.status}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                  Config
                </Button>
                <Button size="sm">
                  <Play className="h-4 w-4" />
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- QRA Strategy ----------
function QRASection() {
  const plays = [
    { tier: "Brilliant", title: "Rebundle + 8% price raise", uplift: "+$220k GM", tti: "30d" },
    { tier: "Incremental", title: "Trim paid channel B by 30%", uplift: "+$45k FCF", tti: "14d" },
    { tier: "Stabilization", title: "Payment failure dunning", uplift: "+$18k/mo", tti: "7d" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">QRA Strategy Generator</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Prioritized Plays</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plays.map((p) => (
            <div key={p.title} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.tier}</Badge>
                  <span className="font-medium">{p.title}</span>
                </div>
                <div className="text-sm text-neutral-600">
                  Forecast Uplift {p.uplift} • Time-to-Impact {p.tti}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Explain
                </Button>
                <Button size="sm">Add to Blueprint</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Deal Desk ----------
function DealDesk() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Deal Desk & Pricing</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <Guardrail label="Max Discount" value="12%" />
          <Guardrail label="Min Term" value="12 mo" />
          <Guardrail label="Approval Required &gt;" value="$50k" />
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Value-Metric Simulator</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="w-full">
            <label className="text-sm">Base Price</label>
            <Input defaultValue={1200} />
          </div>
          <div className="w-full">
            <label className="text-sm">Price Metric</label>
            <Input defaultValue="seat" />
          </div>
          <Button className="gap-2">
            <LineChart className="h-4 w-4" />
            Simulate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Guardrail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-neutral-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

// ---------- FP&A ----------
function FPnA() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">FP&A + Cash Console</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 months</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Free Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$85k/mo</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Scenario</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button variant="outline">Worst</Button>
            <Button variant="secondary">Base</Button>
            <Button variant="outline">Good</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Retention ----------
function Retention() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Retention & Expansion</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">At-Risk Accounts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Account {i + 1}</span>
                <Badge variant="outline">Health: {60 + i}%</Badge>
              </div>
              <div className="text-neutral-600">Low adoption • Recommend: playbook + QBR</div>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Playbook
                </Button>
                <Button size="sm">Trigger</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Experiments ----------
function Experiments() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Experiments & Attribution</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Active Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {["Pricing A/B", "Onboarding Variant", "Channel Budget Realloc"].map((name) => (
            <div key={name} className="flex items-center justify-between rounded-xl border p-3">
              <div className="font-medium">{name}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Running</Badge>
                <Button size="sm" variant="outline">
                  Readout
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Partner Scout ----------
function PartnerScout() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Partner & Channel Scout</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Scorecards</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Partner {i + 1}</span>
                <Badge variant="outline">Overlap: {70 + i}%</Badge>
              </div>
              <div className="text-neutral-600">
                Deal influence high • Expected pipeline: ${50 + i * 10}k
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Offer
                </Button>
                <Button size="sm">Activate</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Content Engine ----------
function ContentEngine() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Content & Authority Engine</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Topic Map</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {["Pricing strategy", "NRR mechanics", "FP&A for founders", "RevenueOS case"].map((t) => (
            <div key={t} className="rounded-xl border p-3 text-sm">
              <div className="font-medium">{t}</div>
              <div className="text-neutral-600">Draft ready • Needs proof inserts</div>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Draft
                </Button>
                <Button size="sm">Publish</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Billing & RevOps ----------
function BillingRevOps() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Billing & RevOps</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Revenue Leakage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Failed payment recovery",
            "Quote → Contract → Invoice sync",
            "DSO coaching",
          ].map((t) => (
            <div key={t} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{t}</span>
              </div>
              <Button size="sm" variant="outline">
                Resolve
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Deliverables ----------
function DeliverablesPanel() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Deliverables</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          "Clarity Audit",
          "Gap Map",
          "Intervention Blueprint",
          "RevBoard Dashboard",
          "Monthly ROI Report",
          "Quarterly ROI Synthesis",
          "Case Study Packet",
        ].map((d) => (
          <Card key={d} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">{d}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <Badge variant="secondary">In progress</Badge>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4" />
                  Attach
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Governance ----------
function GovernancePanel() {
  const items = [
    { requirement: "ROI hypothesis", status: "met" },
    { requirement: "QA checklist", status: "met" },
    { requirement: "Owner", status: "met" },
    { requirement: "Payback window", status: "open" },
    { requirement: "TRS Score lever", status: "open" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Governance</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Activation Gate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {items.map((it) => (
            <div key={it.requirement} className="flex items-center justify-between rounded-xl border p-3">
              <span className="font-medium">{it.requirement}</span>
              {it.status === "met" ? (
                <Badge className="gap-1" variant="secondary">
                  <CheckCircle2 className="h-3 w-3" />
                  Met
                </Badge>
              ) : (
                <Badge variant="outline">Open</Badge>
              )}
            </div>
          ))}
          <div className="pt-2">
            <Button className="gap-2" disabled>
              <Play className="h-4 w-4" />
              Enable Module
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">AI Engine Compliance</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl border p-3">
            <div className="mb-1 font-medium">Model: QRA-Forecast v1.2</div>
            <div>F1 0.78 • MAPE 9% • Thresholds: F1≥0.75, MAPE≤10%</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">Approved</Badge>
              <Button size="sm" variant="outline">
                View Card
              </Button>
            </div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="mb-1 font-medium">Model: Churn-Risk v0.9</div>
            <div>AUROC 0.73 • Precision@Top10% 0.41 • Thresholds: AUROC≥0.7</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">Approved</Badge>
              <Button size="sm" variant="outline">
                View Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Settings ----------
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <IntegrationRow name="Google Calendar" status="Connected" />
          <IntegrationRow name="Email" status="Connected" />
          <IntegrationRow name="Payments" status="Connected" />
          <IntegrationRow name="Ads" status="Pending" />
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationRow({
  name,
  status,
}: {
  name: string;
  status: "Connected" | "Pending";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="font-medium">{name}</div>
      <Badge variant={status === "Connected" ? "secondary" : "outline"}>{status}</Badge>
    </div>
  );
}
