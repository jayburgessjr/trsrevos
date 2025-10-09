import { ExecDashboard, TimeScope, Segment, Money } from "./types";

let _scope: { time: TimeScope; segment: Segment } = { time: "QTD", segment: {} };

function $n(v: number) { return Math.max(0, Math.round(v)); }
function pct(v: number) { return Math.max(0, Math.min(100, Math.round(v))); }
function money(v: number): Money { return Math.max(0, Math.round(v)); }

// Stub generator with deterministic numbers; replace with DB later
export function getDashboard(scope = _scope): ExecDashboard {
  const now = new Date().toISOString();

  return {
    scope,
    ribbon: {
      northStarRunRate: money(1250_000),
      northStarDeltaVsPlanPct: 8,
      cashOnHand: money(385_000),
      runwayDays: 210,
      trsScore: pct(72),
      riskIndexPct: pct(14),
    },
    sales: {
      pipelineCoverageX: 3.1,
      winRate7dPct: pct(33),
      winRate30dPct: pct(29),
      cycleTimeDaysMedian: 28,
    },
    finance: {
      arTotal: money(47_500),
      dsoDays: 32,
      cashCollected7d: money(10_800),
      priceRealizationPct: pct(97),
    },
    postSale: {
      nrrPct: pct(116),
      grrPct: pct(94),
      expansionPipeline: money(18_500),
      deliveryUtilizationPct: pct(83),
    },
    forecast: {
      horizonWeeks: 8,
      p10: Array.from({length:8}, (_,i)=>({ ts: now, value: 60 + i*8 })),
      p50: Array.from({length:8}, (_,i)=>({ ts: now, value: 80 + i*10 })),
      p90: Array.from({length:8}, (_,i)=>({ ts: now, value: 105 + i*12 })),
    },
    cashPanel: { dueToday: money(4_200), dueThisWeek: money(12_400), atRisk: money(6_900), scenarioDSOdaysSaved: 5 },
    pricing: {
      discountWinCurve: [0,5,10,15,20].map(d => ({ discountPct: d, winRatePct: pct(20 + d/2), marginPct: pct(80 - d) })),
      guardrailBreaches: [
        { id:"b1", account:"Acme", owner:"J. Lee", discountPct:22, ts: now },
        { id:"b2", account:"Omni", owner:"S. Chen", discountPct:19, ts: now },
      ],
    },
    content: {
      influenced: money(21_400),
      advanced: money(12_800),
      closedWon: money(3_200),
      usageRatePct: pct(41),
      topAssets: [
        { id:"c1", title:"ROI Calculator", impact$: money(8400), worksPct: 62 },
        { id:"c2", title:"Case Study – Delta", impact$: money(5200), worksPct: 48 },
        { id:"c3", title:"Playbook – Value Story", impact$: money(3400), worksPct: 55 },
      ],
    },
    partners: {
      activePartners: 6,
      coSellOpps: 9,
      sourcedPipeline: money(11_200),
      winRateVsDirectDeltaPts: 6,
    },
    clients: {
      atRisk: 3,
      healthAvg: 76,
      churnProbMap: [
        { clientId:"cl1", client:"TechVentures", churnProbPct:22, firstAction:"Exec QBR: pricing vs outcomes" },
        { clientId:"cl2", client:"Northwave",    churnProbPct:18, firstAction:"Enablement: adoption KPI 60→80%" },
        { clientId:"cl3", client:"Helio",        churnProbPct:15, firstAction:"Services: compounding rollout" },
      ],
    },
    capacity: {
      utilizationPct: 82,
      backlogWeeks: 3.5,
      revosLeadTimes: [
        { phase:"Discovery", days:7 },
        { phase:"Data", days:9 },
        { phase:"Algorithm", days:11 },
        { phase:"Architecture", days:14 },
        { phase:"Compounding", days:10 },
      ],
      bottlenecks: [{ phase:"Architecture", reason:"DevOps queue", suggestion:"Swap 0.5 FTE from Data → Arch for 2 weeks" }],
    },
    experiments: [
      { id:"e1", name:"Value-Metric CTA", owner:"M. Singh", upliftPct:12, pValue:0.04, decisionBy: now, status:"DECISION_DUE" },
      { id:"e2", name:"Partner Co-sell Email", owner:"A. Rivera", upliftPct:8, pValue:0.11, decisionBy: now, status:"RUNNING" },
    ],
    alerts: [
      { id:"a1", severity:"high", kind:"Forecast", message:"Coverage shortfall in Week 6", ts: now, actionLabel:"Create Commit Set", href:"/pipeline?tab=Analytics&week=6" },
      { id:"a2", severity:"med", kind:"DSO", message:"DSO trending +3 days vs last month", ts: now, actionLabel:"Open Collections", href:"/finance?tab=Analytics#collections" },
      { id:"a3", severity:"med", kind:"Pricing", message:"2 guardrail breaches > 18% discount", ts: now, actionLabel:"Open Deal Desk", href:"/pipeline?tab=Reports#deal-desk" },
    ],
  };
}

// Scope mutations
export function setScope(time: TimeScope, segment: Segment) { _scope = { time, segment }; return getDashboard(_scope); }
