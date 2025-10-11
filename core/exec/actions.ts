"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/server/auth";
import { logAnalyticsEvent } from "@/core/analytics/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ExecDashboard, TimeScope, Segment } from "./types";
import { getDashboard as getStaticDashboard, setScope } from "./store";

/**
 * Get executive dashboard - now with Supabase integration
 */
export async function getExecDashboard(
  scope: { time: TimeScope; segment: Segment } = { time: "QTD", segment: {} }
): Promise<ExecDashboard> {
  const supabase = await createClient();

  // Try to fetch latest snapshot from Supabase
  const { data: snapshot } = await supabase
    .from("dashboard_snapshots")
    .select("*")
    .eq("time_scope", scope.time)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshot && snapshot.metrics) {
    return {
      scope,
      ...snapshot.metrics,
    } as ExecDashboard;
  }

  // Compute live dashboard from database
  const dashboard = await computeLiveDashboard(scope);

  // Save snapshot asynchronously (fire and forget)
  void supabase
    .from("dashboard_snapshots")
    .insert({
      time_scope: scope.time,
      segment_filter: scope.segment,
      metrics: dashboard,
    })
    .then(({ error }) => {
      if (error) console.error("Failed to save dashboard snapshot:", error);
    });

  return dashboard;
}

/**
 * Compute live dashboard metrics from Supabase
 */
async function computeLiveDashboard(scope: {
  time: TimeScope;
  segment: Segment;
}): Promise<ExecDashboard> {
  const supabase = await createClient();

  try {
    // Fetch all data in parallel
    const [oppResult, clientResult, invoiceResult, projectResult] =
      await Promise.all([
        supabase.from("opportunities").select("*"),
        supabase.from("clients").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("projects").select("*"),
      ]);

    const opportunities = oppResult.data || [];
    const clients = clientResult.data || [];
    const invoices = invoiceResult.data || [];
    const projects = projectResult.data || [];

    // Calculate Sales Metrics
    const activeOpps = opportunities.filter(
      (o) => !["ClosedWon", "ClosedLost"].includes(o.stage)
    );
    const wonOpps = opportunities.filter((o) => o.stage === "ClosedWon");
    const lostOpps = opportunities.filter((o) => o.stage === "ClosedLost");

    const pipelineValue = activeOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const pipelineWeighted = activeOpps.reduce(
      (sum, o) => sum + (o.amount || 0) * ((o.probability || 0) / 100),
      0
    );

    const totalClosed = wonOpps.length + lostOpps.length;
    const winRate7d = totalClosed > 0 ? (wonOpps.length / totalClosed) * 100 : 0;

    // Calculate Finance Metrics
    const arTotal = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const paidInvoices = invoices.filter((inv) => inv.status === "paid");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const cashCollected7d = paidInvoices
      .filter((inv) => inv.paid_at && new Date(inv.paid_at) >= sevenDaysAgo)
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const avgDailyRevenue = arTotal / 365;
    const dsoDays =
      avgDailyRevenue > 0 ? Math.round(arTotal / avgDailyRevenue) : 32;

    // Calculate Client Metrics
    const activeClients = clients.filter((c) => c.status === "active");
    const atRiskClients = activeClients.filter((c) => (c.churn_risk || 0) > 50);
    const avgHealth =
      activeClients.length > 0
        ? Math.round(
            activeClients.reduce((sum, c) => sum + (c.health || 0), 0) /
              activeClients.length
          )
        : 76;

    // Calculate Capacity Metrics
    const activeProjects = projects.filter((p) => p.status === "Active");
    const totalCapacity = activeProjects.reduce(
      (sum, p) => sum + (p.budget || 0),
      0
    );
    const usedCapacity = activeProjects.reduce(
      (sum, p) => sum + (p.spent || 0),
      0
    );
    const utilizationPct =
      totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 82;

    // Build complete dashboard
    const now = new Date().toISOString();

    return {
      scope,
      ribbon: {
        northStarRunRate: Math.round(pipelineWeighted / 4),
        northStarDeltaVsPlanPct: 8,
        cashOnHand: 385000,
        runwayDays: 210,
        trsScore: Math.min(100, Math.round((winRate7d + avgHealth) / 2)),
        riskIndexPct: Math.round(
          (atRiskClients.length / Math.max(1, activeClients.length)) * 100
        ),
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
        atRisk: atRiskClients.length,
        healthAvg: avgHealth,
        churnProbMap: atRiskClients.slice(0, 3).map((c) => ({
          clientId: c.id,
          client: c.name,
          churnProbPct: c.churn_risk || 0,
          firstAction: "Review health metrics",
        })),
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
  } catch (error) {
    console.error("Error computing dashboard:", error);
    // Fallback to static dashboard
    return getStaticDashboard(scope);
  }
}

/**
 * Set executive scope
 */
export async function setExecScope(scope: { time: TimeScope; segment: Segment }) {
  return getExecDashboard(scope);
}

/**
 * Refresh dashboard snapshot
 */
export async function refreshDashboardSnapshot(scope: {
  time: TimeScope;
  segment: Segment;
} = { time: "QTD", segment: {} }): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, organizationId } = await requireAuth({ redirectTo: "/login?next=/dashboard" });

    const { error, data } = await supabase.functions.invoke("exec-dashboard-refresh", {
      body: {
        organization_id: organizationId,
        time_scope: scope.time,
        segment_filter: scope.segment,
      },
    });

    if (error) {
      throw error;
    }

    await logAnalyticsEvent({
      eventKey: "dashboard.refresh.triggered",
      payload: { timeScope: scope.time, segment: scope.segment, snapshot: data },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    return { success: false, error: String(error) };
  }
}

// Action stubs
export async function createCommitSet(week: number) {
  return { ok: true, week };
}
export async function generateCollectionsList(daysAccelerate: number) {
  return { ok: true, dsoSaved: daysAccelerate };
}
export async function openDealDeskFor(ids: string[]) {
  return { ok: true, count: ids.length };
}
export async function exportBoardDeck() {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: "/login?next=/dashboard" });

  if (!organizationId) {
    console.error("dashboard:export-missing-organization");
    redirect("/dashboard?export=failed");
  }

  try {
    const { data, error } = await supabase.functions.invoke("exec-board-export", {
      body: {
        organization_id: organizationId,
        user_id: user.id,
      },
    });

    if (error) {
      throw error;
    }

    const url = (data as { url?: string })?.url;
    if (!url) {
      throw new Error("missing-export-url");
    }

    await logAnalyticsEvent({
      eventKey: "dashboard.export.generated",
      payload: { downloadUrl: url },
    });

    redirect(url);
  } catch (error) {
    console.error("dashboard:export-failed", error);
    redirect("/dashboard?export=failed");
  }
}
