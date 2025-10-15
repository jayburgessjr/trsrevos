import type { OpportunityWithNotes } from "./actions";

export type PipelineStageSummary = {
  stage: string;
  deals: number;
  totalValue: number;
  weightedValue: number;
  averageProbability: number;
  historicalWinRate: number;
};

export type ScenarioProjection = {
  key: "commit" | "upside" | "best";
  label: string;
  value: number;
  coverage: number;
  variance: number;
  description: string;
};

export type OpportunityScoreCard = {
  id: string;
  name: string;
  clientName: string | null;
  ownerName: string | null;
  stage: string;
  amount: number;
  score: number;
  riskLevel: "low" | "medium" | "high";
  signals: string[];
  nextStep?: string | null;
  closeDate?: string | null;
};

export type PipelineAlertCandidate = {
  id: string;
  type: "coverage" | "stalled" | "expiring" | "variance";
  severity: "info" | "warning" | "critical";
  summary: string;
  detail?: string;
  opportunityId?: string;
  stage?: string;
  amount?: number;
  dueDate?: string;
};

export type PipelineAnalytics = {
  target: number;
  stageSummary: PipelineStageSummary[];
  weightedTotal: number;
  pipelineTotal: number;
  coverageX: number;
  scenarios: Record<"commit" | "upside" | "best", ScenarioProjection>;
  ownerWinRates: Record<string, number>;
  historicalStageWinRates: Record<string, number>;
  opportunityScores: OpportunityScoreCard[];
  alerts: PipelineAlertCandidate[];
};

const STAGE_ORDER: Array<
  "Prospect" | "Qualify" | "Proposal" | "Negotiation" | "ClosedWon" | "ClosedLost"
> = ["Prospect", "Qualify", "Proposal", "Negotiation", "ClosedWon", "ClosedLost"];

const STAGE_WEIGHTS: Record<string, number> = {
  Prospect: 0.15,
  Qualify: 0.3,
  Proposal: 0.55,
  Negotiation: 0.8,
  ClosedWon: 1,
  ClosedLost: 0,
};

const SCENARIO_METADATA: Record<
  "commit" | "upside" | "best",
  { label: string; description: string }
> = {
  commit: {
    label: "Commit",
    description: "Deals in late stage with >70% confidence and executive coverage.",
  },
  upside: {
    label: "Upside",
    description: "Pipeline that can be pulled in with acceleration plays and exec focus.",
  },
  best: {
    label: "Best Case",
    description: "All open pipeline excluding losses, assuming cycle time holds.",
  },
};

function daysBetween(a: string | null, b: string | null) {
  if (!a || !b) return 0;
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function computeHistoricalStageWinRates(opportunities: OpportunityWithNotes[]) {
  const closed = opportunities.filter((opp) => opp.close_date);
  const buckets = STAGE_ORDER.reduce<Record<string, { won: number; total: number }>>(
    (acc, stage) => {
      acc[stage] = { won: 0, total: 0 };
      return acc;
    },
    {},
  );

  closed.forEach((opp) => {
    const cycle = daysBetween(opp.created_at, opp.close_date);
    let inferredStage: (typeof STAGE_ORDER)[number] = "Prospect";

    if (cycle <= 14) {
      inferredStage = "Negotiation";
    } else if (cycle <= 28) {
      inferredStage = "Proposal";
    } else if (cycle <= 45) {
      inferredStage = "Qualify";
    }

    buckets[inferredStage].total += 1;
    if (opp.stage === "ClosedWon") {
      buckets[inferredStage].won += 1;
    }
  });

  const results = STAGE_ORDER.reduce<Record<string, number>>((acc, stage) => {
    if (stage === "ClosedLost") {
      acc[stage] = 0;
      return acc;
    }

    const data = buckets[stage];
    const base = STAGE_WEIGHTS[stage] ?? 0.3;
    if (!data.total) {
      acc[stage] = base;
      return acc;
    }

    acc[stage] = Math.min(1, Math.max(0.05, data.won / data.total));
    return acc;
  }, {} as Record<string, number>);

  return results;
}

function computeOwnerWinRates(opportunities: OpportunityWithNotes[]) {
  const closed = opportunities.filter((opp) => opp.stage === "ClosedWon" || opp.stage === "ClosedLost");
  const stats = new Map<string, { won: number; total: number }>();

  closed.forEach((opp) => {
    const key = opp.owner_id || "unknown";
    const entry = stats.get(key) ?? { won: 0, total: 0 };
    entry.total += 1;
    if (opp.stage === "ClosedWon") {
      entry.won += 1;
    }
    stats.set(key, entry);
  });

  const overall = closed.length
    ? closed.filter((opp) => opp.stage === "ClosedWon").length / closed.length
    : 0.35;

  const map: Record<string, number> = {};
  stats.forEach((value, key) => {
    map[key] = value.total ? value.won / value.total : overall;
  });

  return { ownerWinRates: map, overallWinRate: overall };
}

function classifyAlerts(
  opportunities: OpportunityWithNotes[],
  target: number,
  scenarios: Record<"commit" | "upside" | "best", ScenarioProjection>,
  coverageX: number,
): PipelineAlertCandidate[] {
  const alerts: PipelineAlertCandidate[] = [];
  const now = Date.now();

  if (coverageX < 1.8) {
    alerts.push({
      id: `coverage-${coverageX.toFixed(2)}`,
      type: "coverage",
      severity: coverageX < 1.2 ? "critical" : "warning",
      summary: `Pipeline coverage ${coverageX.toFixed(1)}x vs ${(
        target / 1_000_000
      ).toFixed(1)}M quarterly target`,
      detail: "Add late-stage opps or expand existing deals to protect commit.",
    });
  }

  if (scenarios.commit.variance < 0) {
    alerts.push({
      id: `variance-commit-${Math.abs(scenarios.commit.variance)}`,
      type: "variance",
      severity: Math.abs(scenarios.commit.variance) > target * 0.2 ? "critical" : "warning",
      summary: `Commit shortfall ${formatCurrency(Math.abs(scenarios.commit.variance))}`,
      detail: "Execute pull-forward plays or adjust forecast guidance.",
    });
  }

  const staleThreshold = 30;
  opportunities
    .filter((opp) => !["ClosedWon", "ClosedLost"].includes(opp.stage))
    .forEach((opp) => {
      const lastUpdated = new Date(opp.updated_at).getTime();
      const daysStale = Math.round((now - lastUpdated) / (1000 * 60 * 60 * 24));
      if (daysStale >= staleThreshold) {
        alerts.push({
          id: `stalled-${opp.id}`,
          type: "stalled",
          severity: daysStale > 45 ? "critical" : "warning",
          summary: `${opp.name} stalled ${daysStale}d in ${opp.stage}`,
          detail: opp.next_step ?? "Add exec sponsor touch to re-engage.",
          opportunityId: opp.id,
          stage: opp.stage,
          amount: opp.amount,
        });
      }
    });

  opportunities
    .filter((opp) => !["ClosedWon", "ClosedLost"].includes(opp.stage))
    .forEach((opp) => {
      if (!opp.close_date) return;
      const daysToClose = daysBetween(new Date().toISOString(), opp.close_date);
      if (daysToClose <= 14) {
        alerts.push({
          id: `expiring-${opp.id}`,
          type: "expiring",
          severity: daysToClose <= 7 ? "critical" : "warning",
          summary: `${opp.name} quote expires in ${Math.max(0, daysToClose)}d`,
          detail: opp.next_step ?? "Send final pricing + exec alignment.",
          opportunityId: opp.id,
          stage: opp.stage,
          amount: opp.amount,
          dueDate: opp.close_date ?? undefined,
        });
      }
    });

  return alerts;
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function buildPipelineAnalytics(
  opportunities: OpportunityWithNotes[],
  options: { target: number },
): PipelineAnalytics {
  const target = options.target;

  const historicalStageWinRates = computeHistoricalStageWinRates(opportunities);
  const { ownerWinRates, overallWinRate } = computeOwnerWinRates(opportunities);

  const stageSummary: PipelineStageSummary[] = STAGE_ORDER.map((stage) => {
    const deals = opportunities.filter((opp) => opp.stage === stage);
    const totalValue = deals.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    const weight = STAGE_WEIGHTS[stage] ?? (deals[0]?.probability ?? 50) / 100;
    const weightedValue = deals.reduce(
      (sum, opp) => sum + (opp.amount || 0) * (STAGE_WEIGHTS[stage] ?? (opp.probability || 0) / 100),
      0,
    );
    const averageProbability =
      deals.length > 0
        ? deals.reduce((sum, opp) => sum + (opp.probability || weight * 100), 0) / deals.length
        : weight * 100;

    return {
      stage,
      deals: deals.length,
      totalValue,
      weightedValue,
      averageProbability,
      historicalWinRate: historicalStageWinRates[stage] ?? weight,
    };
  });

  const weightedTotal = stageSummary.reduce((sum, stage) => sum + stage.weightedValue, 0);
  const pipelineTotal = stageSummary.reduce((sum, stage) => sum + stage.totalValue, 0);
  const coverageX = target > 0 ? pipelineTotal / target : 0;

  const commitDeals = opportunities.filter(
    (opp) =>
      ["Negotiation", "ClosedWon"].includes(opp.stage) || (opp.probability ?? 0) >= 70,
  );
  const upsideDeals = opportunities.filter(
    (opp) =>
      ["Proposal", "Negotiation", "ClosedWon"].includes(opp.stage) ||
      (opp.probability ?? 0) >= 50,
  );
  const bestDeals = opportunities.filter((opp) => opp.stage !== "ClosedLost");

  const scenarioValues = {
    commit: commitDeals.reduce((sum, opp) => sum + (opp.amount || 0), 0),
    upside: upsideDeals.reduce((sum, opp) => sum + (opp.amount || 0), 0),
    best: bestDeals.reduce((sum, opp) => sum + (opp.amount || 0), 0),
  } as const;

  const scenarios: Record<"commit" | "upside" | "best", ScenarioProjection> = {
    commit: {
      key: "commit",
      label: SCENARIO_METADATA.commit.label,
      description: SCENARIO_METADATA.commit.description,
      value: scenarioValues.commit,
      coverage: target > 0 ? scenarioValues.commit / target : 0,
      variance: scenarioValues.commit - target,
    },
    upside: {
      key: "upside",
      label: SCENARIO_METADATA.upside.label,
      description: SCENARIO_METADATA.upside.description,
      value: scenarioValues.upside,
      coverage: target > 0 ? scenarioValues.upside / target : 0,
      variance: scenarioValues.upside - target,
    },
    best: {
      key: "best",
      label: SCENARIO_METADATA.best.label,
      description: SCENARIO_METADATA.best.description,
      value: scenarioValues.best,
      coverage: target > 0 ? scenarioValues.best / target : 0,
      variance: scenarioValues.best - target,
    },
  };

  const alerts = classifyAlerts(opportunities, target, scenarios, coverageX);

  const now = Date.now();
  const scored: OpportunityScoreCard[] = opportunities
    .filter((opp) => !["ClosedWon", "ClosedLost"].includes(opp.stage))
    .map((opp) => {
      const stageWeight = STAGE_WEIGHTS[opp.stage] ?? (opp.probability ?? 0) / 100;
      const historical = historicalStageWinRates[opp.stage] ?? stageWeight;
      const ownerRate = ownerWinRates[opp.owner_id ?? "unknown"] ?? overallWinRate;
      const updated = new Date(opp.updated_at).getTime();
      const daysSinceUpdate = Math.round((now - updated) / (1000 * 60 * 60 * 24));
      const freshness = Math.max(0, 1 - Math.min(daysSinceUpdate / 45, 1));
      const agentKeywords = ["rosie", "agent", "playbook", "automation", "ai"];
      const agentTouches = (opp.notes || []).filter((note) =>
        agentKeywords.some((keyword) => note.body?.toLowerCase().includes(keyword)),
      ).length;
      const agentSignal = agentTouches > 0 ? Math.min(1, 0.6 + agentTouches * 0.1) : opp.notes?.length ? 0.4 : 0.25;
      const baseProbability = (opp.probability ?? stageWeight * 100) / 100;

      const rawScore =
        baseProbability * 35 +
        historical * 25 +
        ownerRate * 20 +
        agentSignal * 10 +
        freshness * 10;

      const score = Math.max(0, Math.min(100, Math.round(rawScore)));
      const riskLevel: "low" | "medium" | "high" = score >= 70 ? "low" : score >= 45 ? "medium" : "high";

      const signals: string[] = [
        `Stage weight ${(stageWeight * 100).toFixed(0)}%`,
        `Owner win rate ${(ownerRate * 100).toFixed(0)}%`,
      ];

      if (agentTouches > 0) {
        signals.push(`${agentTouches} agent insight${agentTouches > 1 ? "s" : ""}`);
      } else if (opp.notes?.length) {
        signals.push("Manual notes logged");
      } else {
        signals.push("Needs agent activation");
      }

      if (daysSinceUpdate > 21) {
        signals.push(`Stale ${daysSinceUpdate}d`);
      }

      return {
        id: opp.id,
        name: opp.name,
        clientName: opp.client?.name ?? null,
        ownerName: opp.owner?.name ?? null,
        stage: opp.stage,
        amount: opp.amount,
        score,
        riskLevel,
        signals,
        nextStep: opp.next_step,
        closeDate: opp.close_date,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    target,
    stageSummary,
    weightedTotal,
    pipelineTotal,
    coverageX,
    scenarios,
    ownerWinRates,
    historicalStageWinRates,
    opportunityScores: scored,
    alerts,
  };
}
