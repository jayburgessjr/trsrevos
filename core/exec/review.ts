"use server";

import { randomUUID } from "crypto";

import { logAnalyticsEvent } from "@/core/analytics/actions";
import { revalidatePath } from "next/cache";

import type { ExecDashboard, MetricPoint } from "./types";
import { requireAuth } from "@/lib/server/auth";

export type ForecastScenarioKey = "commit" | "upside" | "best";

export type ForecastReviewComment = {
  id: string;
  scenario: ForecastScenarioKey;
  comment: string;
  focusArea?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};

export type ForecastReviewApproval = {
  id: string;
  scenario: ForecastScenarioKey;
  status: "approved" | "changes_requested";
  note?: string;
  approverId: string;
  approverName: string;
  createdAt: string;
};

export type ForecastExportVersion = {
  id: string;
  version: number;
  scenario: ForecastScenarioKey;
  createdAt: string;
  authorId: string;
  authorName: string;
  coverage: number;
  riskIndex: number;
  downloadUrl: string;
};

export type ForecastReviewState = {
  comments: ForecastReviewComment[];
  approvals: ForecastReviewApproval[];
  versions: ForecastExportVersion[];
};

type ExportPayload = {
  scenario: ForecastScenarioKey;
  commitTrajectory: MetricPoint[];
  upsideTrajectory: MetricPoint[];
  bestTrajectory: MetricPoint[];
  metadata: {
    coverage: number;
    riskIndex: number;
  };
};

const REVIEW_STATE = new Map<string, ForecastReviewState>();

function scopeKey(scope: ExecDashboard["scope"]) {
  const segment = scope.segment || {};
  return [
    scope.time,
    segment.businessLine ?? "*",
    segment.icp ?? "*",
    segment.channel ?? "*",
    segment.region ?? "*",
  ].join("|");
}

function cloneState(state: ForecastReviewState): ForecastReviewState {
  return {
    comments: [...state.comments],
    approvals: [...state.approvals],
    versions: [...state.versions],
  };
}

function getDisplayName(user: { email?: string | null; user_metadata?: Record<string, any> }) {
  return (
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    "Revenue Operator"
  );
}

function getState(scope: ExecDashboard["scope"]) {
  const key = scopeKey(scope);
  if (!REVIEW_STATE.has(key)) {
    REVIEW_STATE.set(key, { comments: [], approvals: [], versions: [] });
  }
  return REVIEW_STATE.get(key)!;
}

export async function getForecastReviewState(scope: ExecDashboard["scope"]) {
  const state = getState(scope);
  return cloneState(state);
}

export async function submitForecastComment(input: {
  scope: ExecDashboard["scope"];
  scenario: ForecastScenarioKey;
  comment: string;
  focusArea?: string;
}) {
  if (!input.comment?.trim()) {
    return { ok: false, error: "missing-comment" } as const;
  }

  const context = await requireAuth({ redirectTo: "/login?next=/dashboard" });
  const state = getState(input.scope);
  const now = new Date().toISOString();
  const comment: ForecastReviewComment = {
    id: randomUUID(),
    scenario: input.scenario,
    comment: input.comment.trim(),
    focusArea: input.focusArea?.trim() || undefined,
    authorId: context.user.id,
    authorName: getDisplayName(context.user),
    createdAt: now,
  };

  state.comments = [comment, ...state.comments].slice(0, 50);

  await logAnalyticsEvent({
    eventKey: "forecast.review.comment",
    payload: {
      scenario: input.scenario,
      focusArea: comment.focusArea ?? null,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, comment } as const;
}

export async function recordForecastApproval(input: {
  scope: ExecDashboard["scope"];
  scenario: ForecastScenarioKey;
  status: "approved" | "changes_requested";
  note?: string;
}) {
  const context = await requireAuth({ redirectTo: "/login?next=/dashboard" });
  const state = getState(input.scope);
  const now = new Date().toISOString();

  const approval: ForecastReviewApproval = {
    id: randomUUID(),
    scenario: input.scenario,
    status: input.status,
    note: input.note?.trim() || undefined,
    approverId: context.user.id,
    approverName: getDisplayName(context.user),
    createdAt: now,
  };

  state.approvals = state.approvals.filter(
    (existing) => !(existing.approverId === approval.approverId && existing.scenario === approval.scenario),
  );
  state.approvals.unshift(approval);
  state.approvals = state.approvals.slice(0, 30);

  await logAnalyticsEvent({
    eventKey: "forecast.review.approval",
    payload: {
      scenario: input.scenario,
      status: input.status,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, approval } as const;
}

export async function exportForecastSnapshot(scope: ExecDashboard["scope"], payload: ExportPayload) {
  const context = await requireAuth({ redirectTo: "/login?next=/dashboard" });
  const state = getState(scope);
  const versionNumber = (state.versions[0]?.version ?? 0) + 1;

  const rows: string[] = ["Week,Commit,Upside,Best",];
  const horizon = Math.max(
    payload.commitTrajectory.length,
    payload.upsideTrajectory.length,
    payload.bestTrajectory.length,
  );

  for (let i = 0; i < horizon; i += 1) {
    const commitPoint = payload.commitTrajectory[i];
    const upsidePoint = payload.upsideTrajectory[i];
    const bestPoint = payload.bestTrajectory[i];
    const timestamp = commitPoint?.ts || upsidePoint?.ts || bestPoint?.ts || `Week ${i + 1}`;
    rows.push([
      timestamp,
      commitPoint?.value ?? "",
      upsidePoint?.value ?? "",
      bestPoint?.value ?? "",
    ].join(","));
  }

  rows.push("", `Coverage,${payload.metadata.coverage.toFixed(2)}`, `Risk Index %,${payload.metadata.riskIndex.toFixed(1)}`);

  const csv = rows.join("\n");
  const downloadUrl = `data:text/csv;charset=utf-8;base64,${Buffer.from(csv, "utf-8").toString("base64")}`;

  const version: ForecastExportVersion = {
    id: randomUUID(),
    version: versionNumber,
    scenario: payload.scenario,
    createdAt: new Date().toISOString(),
    authorId: context.user.id,
    authorName: getDisplayName(context.user),
    coverage: payload.metadata.coverage,
    riskIndex: payload.metadata.riskIndex,
    downloadUrl,
  };

  state.versions = [version, ...state.versions].slice(0, 20);

  await logAnalyticsEvent({
    eventKey: "forecast.export.finance",
    payload: {
      scenario: payload.scenario,
      version: version.version,
      coverage: payload.metadata.coverage,
      riskIndex: payload.metadata.riskIndex,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, version } as const;
}
