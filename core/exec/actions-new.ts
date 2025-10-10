"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ExecDashboard, TimeScope, Segment } from "./types";

/**
 * Get executive dashboard data from Supabase or compute it
 */
export async function getExecDashboard(
  scope: { time: TimeScope; segment: Segment } = { time: "QTD", segment: {} }
): Promise<ExecDashboard> {
  const supabase = await createClient();

  // Try to fetch latest snapshot
  const { data: snapshot } = await supabase
    .from("dashboard_snapshots")
    .select("*")
    .eq("time_scope", scope.time)
    .order("computed_at", { ascending: false })
    .limit(1)
    .single();

  if (snapshot && snapshot.metrics) {
    // Return cached snapshot
    return {
      scope,
      ...snapshot.metrics,
    } as ExecDashboard;
  }

  // Compute live dashboard metrics
  const dashboard = await computeLiveDashboard(scope);

  // Save snapshot for future use
  await supabase.from("dashboard_snapshots").insert({
    time_scope: scope.time,
    segment_filter: scope.segment,
    metrics: dashboard,
  });

  return dashboard;
}

/**
 * Compute live dashboard from database
 */
async function computeLiveDashboard(scope: {
  time: TimeScope;
  segment: Segment;
}): Promise<ExecDashboard> {
  const supabase = await createClient();

  // Fetch all necessary data in parallel
  const [
    { data: opportunities },
    { data: clients },
    { data: invoices },
    { data: projects },
  ] = await Promise.all([
    supabase.from("opportunities").select("*"),
    supabase.from("clients").select("*"),
    supabase.from("invoices").select("*"),
    supabase.from("projects").select("*"),
  ]);

  // Calculate Sales Metrics
  const activeOpps = opportunities?.filter(
    (o) => !["ClosedWon", "ClosedLost"].includes(o.stage)
  ) || [];
  const wonOpps = opportunities?.filter((o) => o.stage === "ClosedWon") || [];
  const lostOpps = opportunities?.filter((o) => o.stage === "ClosedLost") || [];

  const pipelineValue = activeOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
  const pipelineWeighted = activeOpps.reduce(
    (sum, o) => sum + (o.amount || 0) * ((o.probability || 0) / 100),
    0
  );

  const winRate7d =
    wonOpps.length + lostOpps.length > 0
      ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100
      : 0;

  // Calculate Finance Metrics
  const arTotal = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const paidInvoices = invoices?.filter((inv) => inv.status === "paid") || [];
  const cashCollected7d =
    paidInvoices
      .filter((inv) => {
        const paidDate = new Date(inv.paid_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return paidDate >= sevenDaysAgo;
      })
      .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  // Calculate DSO
  const avgDailyRevenue = arTotal / 365;
  const dsoDays = avgDailyRevenue > 0 ? Math.round(arTotal / avgDailyRevenue) : 0;

  // Calculate Client Metrics
  const atRiskClients = clients?.filter((c) => (c.churn_risk || 0) > 50).length || 0;
  const avgHealth =
    clients && clients.length > 0
      ? Math.round(
          clients.reduce((sum, c) => sum + (c.health || 0), 0) / clients.length
        )
      : 0;

  // Calculate Capacity Metrics
  const activeProjects = projects?.filter((p) => p.status === "active") || [];
  const totalCapacity = activeProjects.reduce(
    (sum, p) => sum + (p.hours_budgeted || 0),
    0
  );
  const usedCapacity = activeProjects.reduce(
    (sum, p) => sum + (p.hours_actual || 0),
    0
  );
  const utilizationPct =
    totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

  // Build complete dashboard
  const now = new Date().toISOString();

  return {
    scope,
    ribbon: {
      northStarRunRate: Math.round(pipelineValue / 4), // Quarterly projection
      northStarDeltaVsPlanPct: 8,
      cashOnHand: 385000,
      runwayDays: 210,
      trsScore: Math.min(100, Math.round((winRate7d + avgHealth) / 2)),
      riskIndexPct: Math.round((atRiskClients / (clients?.length || 1)) * 100),
    },
    sales: {
      pipelineCoverageX: parseFloat((pipelineValue / 400000).toFixed(1)),
      winRate7dPct: Math.round(winRate7d),
      winRate30dPct: Math.round(winRate7d * 0.95),
      cycleTimeDaysMedian: 28,
    },
    finance: {
      arTotal: Math.round(arTotal),
      dsoDays,
      cashCollected7d: Math.round(cashCollected7d),
      priceRealizationPct: 97,
    },
    postSale: {
      nrrPct: 116,
      grrPct: 94,
      expansionPipeline: 18500,
      deliveryUtilizationPct: utilizationPct,
    },
    forecast: {
      horizonWeeks: 8,
      p10: Array.from({ length: 8 }, (_, i) => ({
        ts: now,
        value: 60 + i * 8,
      })),
      p50: Array.from({ length: 8 }, (_, i) => ({
        ts: now,
        value: 80 + i * 10,
      })),
      p90: Array.from({ length: 8 }, (_, i) => ({
        ts: now,
        value: 105 + i * 12,
      })),
    },
    cashPanel: {
      dueToday: 4200,
      dueThisWeek: 12400,
      atRisk: 6900,
      scenarioDSOdaysSaved: 5,
    },
    pricing: {
      discountWinCurve: [0, 5, 10, 15, 20].map((d) => ({
        discountPct: d,
        winRatePct: Math.round(20 + d / 2),
        marginPct: Math.round(80 - d),
      })),
      guardrailBreaches: [],
    },
    content: {
      influenced: 21400,
      advanced: 12800,
      closedWon: 3200,
      usageRatePct: 41,
      topAssets: [],
    },
    partners: {
      activePartners: 6,
      coSellOpps: 9,
      sourcedPipeline: 11200,
      winRateVsDirectDeltaPts: 6,
    },
    clients: {
      atRisk: atRiskClients,
      healthAvg: avgHealth,
      churnProbMap: [],
    },
    capacity: {
      utilizationPct,
      backlogWeeks: 3.5,
      revosLeadTimes: [
        { phase: "Discovery", days: 7 },
        { phase: "Data", days: 9 },
        { phase: "Algorithm", days: 11 },
        { phase: "Architecture", days: 14 },
        { phase: "Compounding", days: 10 },
      ],
      bottlenecks: [],
    },
    experiments: [],
    alerts: [],
  };
}

/**
 * Refresh dashboard snapshot
 */
export async function refreshDashboardSnapshot(scope: {
  time: TimeScope;
  segment: Segment;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await getExecDashboard(scope);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Export board deck
 */
export async function exportBoardDeck(): Promise<{ ok: boolean; url: string }> {
  // TODO: Generate PDF from dashboard data
  return { ok: true, url: "/exports/exec-brief.pdf" };
}

/**
 * Set executive scope
 */
export async function setExecScope(scope: { time: TimeScope; segment: Segment }) {
  return getExecDashboard(scope);
}

/**
 * Create commit set for forecast
 */
export async function createCommitSet(week: number) {
  return { ok: true, week };
}

/**
 * Generate collections list
 */
export async function generateCollectionsList(daysAccelerate: number) {
  return { ok: true, dsoSaved: daysAccelerate };
}

/**
 * Open deal desk for opportunities
 */
export async function openDealDeskFor(ids: string[]) {
  return { ok: true, count: ids.length };
}
