"use server";

import { randomUUID } from "node:crypto";

import { logAnalyticsEvent } from "@/core/analytics/actions";
import { getAuthContext, requireAuth } from "@/lib/server/auth";

import {
  getMorning,
  setPriorities,
  lockPlan as doLock,
  incrementFocusSession,
} from "./store";
import type { Priority } from "./types";

type DailyPlanRecord = {
  id: string;
  date_iso: string;
  items: Array<Record<string, unknown>> | null;
  locked_at: string | null;
};

type FocusSessionRecord = {
  id: string;
  started_at: string | null;
  completed_at: string | null;
};

const FALLBACK_STATE = getMorning();

function normalizePriorities(list: Array<Record<string, unknown>> | null | undefined) {
  if (!list) return [] as Priority[];
  return list.map((item) => ({
    id: resolvePriorityId(item.id),
    title: String(item.title ?? item.name ?? "Untitled priority"),
    why: String(item.why ?? item.reason ?? ""),
    roi$: Number(item.roi_dollars ?? item.roi$ ?? item.impact ?? 0),
    effort: (item.effort as Priority["effort"]) ?? "Med",
    owner: String(item.owner ?? "You"),
    status: (item.status as Priority["status"]) ?? "Ready",
  }));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function ensureTodayPlan(context: Awaited<ReturnType<typeof requireAuth>>): Promise<DailyPlanRecord | null> {
  const { supabase, user, organizationId } = context;
  const today = todayIsoDate();

  const { data: existing, error: fetchError } = await supabase
    .from("daily_plans")
    .select("id, date_iso, items, locked_at")
    .eq("user_id", user.id)
    .eq("date_iso", today)
    .maybeSingle();

  if (fetchError) {
    console.error("morning:fetch-plan-failed", fetchError);
  }

  if (existing) {
    return existing as DailyPlanRecord;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("daily_plans")
    .insert({
      user_id: user.id,
      organization_id: organizationId,
      date_iso: today,
      items: [],
    })
    .select("id, date_iso, items, locked_at")
    .single();

  if (insertError) {
    console.error("morning:create-plan-failed", insertError);
    return null;
  }

  return inserted as DailyPlanRecord;
}

async function updatePlanItems(
  context: Awaited<ReturnType<typeof requireAuth>>,
  planId: string,
  items: Priority[],
) {
  const { supabase } = context;
  const { error } = await supabase
    .from("daily_plans")
    .update({
      items: items.map((priority) => ({
        id: priority.id,
        title: priority.title,
        why: priority.why,
        roi_dollars: priority.roi$,
        effort: priority.effort,
        owner: priority.owner,
        status: priority.status,
      })),
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId);

  if (error) {
    console.error("morning:update-plan-items-failed", error);
  }
}

function effortToHours(effort: Priority["effort"]) {
  switch (effort) {
    case "Low":
      return 1;
    case "High":
      return 6;
    default:
      return 3;
  }
}

function priorityToRow(planId: string, priority: Priority) {
  return {
    id: priority.id,
    daily_plan_id: planId,
    title: priority.title,
    expected_impact: priority.roi$,
    effort_hours: effortToHours(priority.effort),
    probability: null,
    urgency: null,
    confidence: null,
    strategic_weight: "Incremental",
    next_action: priority.why,
    module_href: null,
    status: priority.status,
    roi_dollars: priority.roi$,
    updated_at: new Date().toISOString(),
  };
}

function resolvePriorityId(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && /^[0-9a-fA-F-]{36}$/.test(trimmed)) {
      return trimmed;
    }
  }
  return randomUUID();
}

// Compute a plan from current signals via Supabase edge function
export async function computePlan(): Promise<{ ok: boolean; priorities: Priority[] }> {
  const context = await requireAuth({ redirectTo: "/login?next=/" });
  const { supabase, user, organizationId } = context;

  const { data, error } = await supabase.functions.invoke("morning-brief", {
    body: {
      user_id: user.id,
      organization_id: organizationId ?? undefined,
      time_horizon: "day",
    },
  });

  if (error) {
    console.error("morning:morning-brief-failed", error);
  }

  const planPayload = (data as { priorities?: Array<Record<string, unknown>> }) ?? {};
  const priorities = normalizePriorities(planPayload.priorities);

  if (priorities.length === 0) {
    priorities.push(...FALLBACK_STATE.priorities);
  }

  setPriorities(priorities);

  const plan = await ensureTodayPlan(context);
  if (plan) {
    await updatePlanItems(context, plan.id, priorities);
    const rows = priorities.map((priority) => priorityToRow(plan.id, priority));
    const { error: priorityError } = await context.supabase
      .from("priority_items")
      .upsert(rows, { onConflict: "id" });

    if (priorityError) {
      console.error("morning:upsert-priority-items-failed", priorityError);
    }
  }

  await logAnalyticsEvent({
    eventKey: "morning.plan.computed",
    payload: {
      planId: plan?.id ?? null,
      priorityCount: priorities.length,
    },
  });

  return { ok: true, priorities };
}

export async function lockPlan(): Promise<{ ok: boolean }> {
  const context = await requireAuth({ redirectTo: "/login?next=/" });
  const plan = await ensureTodayPlan(context);

  if (!plan) {
    return { ok: false };
  }

  const { supabase } = context;
  const { error } = await supabase
    .from("daily_plans")
    .update({ locked_at: new Date().toISOString() })
    .eq("id", plan.id);

  if (error) {
    console.error("morning:lock-plan-failed", error);
    return { ok: false };
  }

  doLock();

  await logAnalyticsEvent({
    eventKey: "morning.plan.locked",
    payload: { planId: plan.id },
  });

  return { ok: true };
}

export async function startFocusBlock(): Promise<{
  ok: boolean;
  startedAt: string;
  endsAt: string;
}> {
  const context = await requireAuth({ redirectTo: "/login?next=/" });
  const plan = await ensureTodayPlan(context);

  const now = new Date();
  const ends = new Date(now.getTime() + 90 * 60 * 1000);

  if (plan) {
    const { supabase, user } = context;
    const { error } = await supabase.from("focus_sessions").insert({
      daily_plan_id: plan.id,
      user_id: user.id,
      started_at: now.toISOString(),
      duration_minutes: 90,
    });

    if (error) {
      console.error("morning:start-focus-failed", error);
    }

    await logAnalyticsEvent({
      eventKey: "morning.focus.started",
      payload: { planId: plan.id, started_at: now.toISOString() },
    });
  }

  return { ok: true, startedAt: now.toISOString(), endsAt: ends.toISOString() };
}

export async function completeFocusBlock(): Promise<{ ok: boolean; totalToday: number }> {
  const context = await requireAuth({ redirectTo: "/login?next=/" });
  const plan = await ensureTodayPlan(context);
  const now = new Date();
  let sessionId: string | null = null;

  if (plan) {
    const { supabase, user } = context;
    const { data: session } = await supabase
      .from("focus_sessions")
      .select("id, started_at, completed_at")
      .eq("daily_plan_id", plan.id)
      .eq("user_id", user.id)
      .is("completed_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (session) {
      sessionId = session.id;
      const started = session.started_at ? new Date(session.started_at) : now;
      const durationMinutes = Math.max(
        1,
        Math.round((now.getTime() - started.getTime()) / 60000),
      );

      const { error } = await supabase
        .from("focus_sessions")
        .update({
          completed_at: now.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq("id", session.id);

      if (error) {
        console.error("morning:complete-focus-failed", error);
      }
    }

    await logAnalyticsEvent({
      eventKey: "morning.focus.completed",
      payload: { planId: plan.id, sessionId },
    });
  }

  const state = incrementFocusSession();
  return { ok: true, totalToday: state.kpis.focusSessionsToday };
}

export async function downloadIcal(): Promise<{ ok: boolean; url: string }> {
  const context = await getAuthContext();
  if (context.user) {
    await logAnalyticsEvent({
      eventKey: "morning.download.ical",
      payload: { userId: context.user.id },
    });
  }

  return { ok: true, url: "/exports/morning-plan.ics" };
}

export async function generateRecap(): Promise<{ ok: boolean; summary: string }> {
  const context = await getAuthContext();
  const state = await getMorningState();
  const summary = `Advanced ${state.kpis.pipelineDollars.toLocaleString()}, win rate ${state.kpis.winRatePct}%, price realization ${state.kpis.priceRealizationPct}%.`;

  if (context.user) {
    await logAnalyticsEvent({
      eventKey: "morning.recap.generated",
      payload: { userId: context.user.id },
    });
  }

  return { ok: true, summary };
}

export async function getMorningState() {
  const context = await getAuthContext();
  const fallback = FALLBACK_STATE;

  if (!context.user) {
    return fallback;
  }

  const { supabase, user } = context;
  const { data: plan, error } = await supabase
    .from("daily_plans")
    .select("id, date_iso, items, locked_at")
    .eq("user_id", user.id)
    .order("date_iso", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("morning:load-state-failed", error);
    return fallback;
  }

  const normalizedPriorities = normalizePriorities(plan?.items ?? null);
  if (normalizedPriorities.length > 0) {
    setPriorities(normalizedPriorities);
  }

  const { data: focusSessions } = plan
    ? await supabase
        .from("focus_sessions")
        .select("id")
        .eq("daily_plan_id", plan.id)
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
    : { data: [] as FocusSessionRecord[] };

  return {
    ...fallback,
    date: plan?.date_iso ? new Date(plan.date_iso).toISOString() : fallback.date,
    planLocked: Boolean(plan?.locked_at),
    priorities: normalizedPriorities.length > 0 ? normalizedPriorities : fallback.priorities,
    kpis: {
      ...fallback.kpis,
      focusSessionsToday: focusSessions?.length ?? fallback.kpis.focusSessionsToday,
    },
  };
}

export async function markPriorityComplete(priorityId: string) {
  const context = await requireAuth({ redirectTo: "/login?next=/" });
  const plan = await ensureTodayPlan(context);
  let updated = false;

  if (plan) {
    const priorities = normalizePriorities(plan.items);
    const index = priorities.findIndex((priority) => priority.id === priorityId);

    if (index !== -1) {
      priorities[index] = { ...priorities[index], status: "Done" };
      setPriorities(priorities);
      await updatePlanItems(context, plan.id, priorities);

      const row = priorityToRow(plan.id, priorities[index]);
      const { error } = await context.supabase
        .from("priority_items")
        .upsert([row], { onConflict: "id" });

      if (error) {
        console.error("morning:priority-complete-upsert-failed", error);
      } else {
        updated = true;
      }
    }
  }

  await logAnalyticsEvent({
    eventKey: "morning.priority.completed",
    payload: { priorityId, planId: plan?.id ?? null },
  });

  return { ok: updated } as const;
}

export async function deferPriority(priorityId: string) {
  const context = await requireAuth({ redirectTo: "/login?next=/" });
  const plan = await ensureTodayPlan(context);
  let updated = false;

  if (plan) {
    const priorities = normalizePriorities(plan.items);
    const index = priorities.findIndex((priority) => priority.id === priorityId);

    if (index !== -1) {
      priorities[index] = { ...priorities[index], status: "Deferred" };
      setPriorities(priorities);
      await updatePlanItems(context, plan.id, priorities);

      const row = priorityToRow(plan.id, priorities[index]);
      const { error } = await context.supabase
        .from("priority_items")
        .upsert([row], { onConflict: "id" });

      if (error) {
        console.error("morning:priority-defer-upsert-failed", error);
      } else {
        updated = true;
      }
    }
  }

  await logAnalyticsEvent({
    eventKey: "morning.priority.deferred",
    payload: { priorityId, planId: plan?.id ?? null },
  });

  return { ok: updated } as const;
}
