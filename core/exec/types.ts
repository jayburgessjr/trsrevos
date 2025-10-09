export type ISODate = string;
export type Money = number;

export type TimeScope = "TODAY"|"7D"|"MTD"|"QTD"|"YTD"|"CUSTOM";
export type Segment = {
  businessLine?: string;
  icp?: string;
  channel?: string;
  region?: string;
};

export type MetricPoint = { ts: ISODate; value: number };

export type ForecastCone = {
  horizonWeeks: number;      // 4–12
  p10: MetricPoint[];        // bookings p10
  p50: MetricPoint[];        // bookings p50 (commit)
  p90: MetricPoint[];        // bookings p90
};

export type HealthRibbon = {
  northStarRunRate: Money;     // e.g., ARR run-rate
  northStarDeltaVsPlanPct: number;
  cashOnHand: Money;
  runwayDays: number;
  trsScore: number;            // 0–100
  riskIndexPct: number;        // probability-weighted downside
};

export type SalesSnapshot = {
  pipelineCoverageX: number;   // coverage vs target
  winRate7dPct: number;
  winRate30dPct: number;
  cycleTimeDaysMedian: number;
};

export type FinanceSnapshot = {
  arTotal: Money;
  dsoDays: number;
  cashCollected7d: Money;
  priceRealizationPct: number;
};

export type PostSaleSnapshot = {
  nrrPct: number;              // rolling 90-day
  grrPct: number;
  expansionPipeline: Money;
  deliveryUtilizationPct: number;
};

export type PricingPower = {
  discountWinCurve: Array<{ discountPct: number; winRatePct: number; marginPct: number }>;
  guardrailBreaches: Array<{ id: string; account: string; owner: string; discountPct: number; ts: ISODate }>;
};

export type ContentInfluence = {
  influenced: Money;
  advanced: Money;
  closedWon: Money;
  usageRatePct: number;
  topAssets: Array<{ id: string; title: string; impact$: Money; worksPct: number }>;
};

export type PartnerLeverage = {
  activePartners: number;
  coSellOpps: number;
  sourcedPipeline: Money;
  winRateVsDirectDeltaPts: number;
};

export type ClientHealth = {
  atRisk: number;
  healthAvg: number;           // 0–100
  churnProbMap: Array<{ clientId: string; client: string; churnProbPct: number; firstAction: string }>;
};

export type CapacityDelivery = {
  utilizationPct: number;
  backlogWeeks: number;
  revosLeadTimes: Array<{ phase: "Discovery"|"Data"|"Algorithm"|"Architecture"|"Compounding"; days: number }>;
  bottlenecks: Array<{ phase: string; reason: string; suggestion: string }>;
};

export type Experiment = {
  id: string; name: string; owner: string;
  upliftPct: number; pValue: number; decisionBy: ISODate;
  status: "RUNNING"|"DECISION_DUE"|"STOPPED"|"PROMOTED";
};

export type AlertItem = {
  id: string; severity: "low"|"med"|"high";
  kind: "SLA"|"Risk"|"Forecast"|"DSO"|"Pricing"|"Churn";
  message: string; ts: ISODate;
  actionLabel: string; href: string;
};

/** Core dashboard aggregate */
export type ExecDashboard = {
  scope: { time: TimeScope; segment: Segment };
  ribbon: HealthRibbon;
  sales: SalesSnapshot;
  finance: FinanceSnapshot;
  postSale: PostSaleSnapshot;
  forecast: ForecastCone;
  cashPanel: {
    dueToday: Money; dueThisWeek: Money; atRisk: Money;
    scenarioDSOdaysSaved: number;
  };
  pricing: PricingPower;
  content: ContentInfluence;
  partners: PartnerLeverage;
  clients: ClientHealth;
  capacity: CapacityDelivery;
  experiments: Experiment[];
  alerts: AlertItem[];
};
