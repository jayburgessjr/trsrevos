// core/revos/dashboard.ts
// Aggregates the TRS-RevOS execution metrics for the unified dashboard view.

import { cache } from 'react';
import type { PostgrestResponse } from '@supabase/supabase-js';

import { createServerClient } from '@/lib/supabase/server';
import type { RevOsDashboardSnapshot } from '@/lib/types/revos';

function getMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function safeNumber(value: number | null | undefined): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
}

export const fetchRevOsDashboard = cache(async (): Promise<RevOsDashboardSnapshot> => {
  const supabase = createServerClient();
  const now = new Date();
  const monthStart = getMonthStart(now);

  const projectSelect = supabase
    .from('projects')
    .select(
      'id, status, phase, health, client_id, budget, spent, project_type, hubspot_deal_id, quickbooks_invoice_url, quickbooks_invoice_id, completed_at, archived_at',
    );

  const documentsSelect = supabase
    .from('documents')
    .select('id, document_type, project_id, status');

  const agentRunsSelect = supabase
    .from('project_agent_runs')
    .select('id, created_at, project_id, agent_key')
    .gte('created_at', monthStart.toISOString());

  const automationSelect = supabase
    .from('automation_events')
    .select('id, occurred_at, project_id, status, source_system')
    .gte('occurred_at', monthStart.toISOString());

  const [projectsRes, documentsRes, agentRunsRes, automationRes] = await Promise.all([
    projectSelect as PromiseLike<PostgrestResponse<any>>,
    documentsSelect as PromiseLike<PostgrestResponse<any>>,
    agentRunsSelect as PromiseLike<PostgrestResponse<any>>,
    automationSelect as PromiseLike<PostgrestResponse<any>>,
  ]);

  if (projectsRes.error) {
    throw projectsRes.error;
  }

  if (documentsRes.error) {
    throw documentsRes.error;
  }

  if (agentRunsRes.error) {
    throw agentRunsRes.error;
  }

  if (automationRes.error) {
    throw automationRes.error;
  }

  const projects = projectsRes.data ?? [];
  const documents = documentsRes.data ?? [];
  const agentRuns = agentRunsRes.data ?? [];
  const automationEvents = automationRes.data ?? [];

  const activeProjects = projects.filter((project) => (project.status ?? '').toLowerCase() === 'active').length;
  const pendingProjects = projects.filter((project) => (project.status ?? '').toLowerCase() === 'pending').length;
  const deliveredProjects = projects.filter((project) => (project.status ?? '').toLowerCase() === 'delivered').length;

  const clientIds = Array.from(
    new Set<string>(projects.map((project) => project.client_id).filter((value): value is string => Boolean(value))),
  );

  let activeClients = 0;
  if (clientIds.length > 0) {
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, status')
      .in('id', clientIds);

    if (clientsError) {
      throw clientsError;
    }

    activeClients = (clients ?? []).filter((client) => (client.status ?? '').toLowerCase() === 'active').length;
  }

  const revenueInProgress = projects.reduce((total, project) => {
    const budget = safeNumber(project.budget);
    const spent = safeNumber(project.spent);
    const remaining = Math.max(budget - spent, 0);
    return total + remaining;
  }, 0);

  const documentsByType = documents.reduce<Record<string, number>>((accumulator, document) => {
    const key = (document.document_type ?? 'Uncategorized').toString();
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  const automationHoursSaved = Math.round(agentRuns.length * 0.75 * 100) / 100;

  return {
    generatedAt: now.toISOString(),
    activeProjects,
    pendingProjects,
    deliveredProjects,
    activeClients,
    revenueInProgress,
    documentsByType,
    automationEvents: automationEvents.length,
    agentsRunThisMonth: agentRuns.length,
    automationHoursSaved,
  };
});

