'use server';

import { getMorning, setPriorities, lockPlan as doLock, incrementFocusSession } from './store';
import { Priority } from './types';

// Compute a plan from current signals (stubbed)
export async function computePlan(): Promise<{ ok: true }> {
  const priorities: Priority[] = [
    {
      id: 'p1',
      title: 'Schedule QBR with Helio',
      why: 'High churn signal',
      roi$: 18000,
      effort: 'Low',
      owner: 'You',
      status: 'Ready',
    },
    {
      id: 'p2',
      title: 'Finalize ReggieAI pricing tiers',
      why: 'Margin expansion',
      roi$: 8000,
      effort: 'Med',
      owner: 'You',
      status: 'Ready',
    },
    {
      id: 'p3',
      title: 'Collections outreach batch',
      why: 'Reduce DSO by 5d',
      roi$: 5000,
      effort: 'Low',
      owner: 'You',
      status: 'Ready',
    },
  ];
  setPriorities(priorities);
  return { ok: true };
}

export async function lockPlan(): Promise<{ ok: true }> {
  doLock();
  return { ok: true };
}

export async function startFocusBlock(): Promise<{ ok: true; startedAt: string; endsAt: string }> {
  const now = Date.now();
  const ends = new Date(now + 90 * 60 * 1000).toISOString();
  return { ok: true, startedAt: new Date(now).toISOString(), endsAt: ends };
}

export async function completeFocusBlock(): Promise<{ ok: true; totalToday: number }> {
  const s = incrementFocusSession();
  return { ok: true, totalToday: s.kpis.focusSessionsToday };
}

export async function downloadIcal(): Promise<{ ok: true; url: string }> {
  // iCal stub; replace with real file later
  return { ok: true, url: '/exports/morning-plan.ics' };
}

export async function generateRecap(): Promise<{ ok: true; summary: string }> {
  const s = getMorning();
  const summary = `Advanced $${s.kpis.pipelineDollars.toLocaleString()}, win rate ${s.kpis.winRatePct}%, price realization ${s.kpis.priceRealizationPct}%.`;
  return { ok: true, summary };
}

export async function getMorningState() {
  return getMorning();
}
