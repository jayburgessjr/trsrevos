'use client'

import { createClient } from '@/lib/supabase/client'

const REVENUE_CLARITY_FUNCTION = 'revenue-clarity-ai'
const BLUEPRINT_FUNCTION = 'revenue-clear-blueprint'
const ADVISOR_FUNCTION = 'revenue-clear-advisor'
const REPORT_FUNCTION = 'revenue-clear-report'
const PROPOSAL_FUNCTION = 'revenue-clear-proposal'

type AutomationResponse<T = Record<string, unknown>> = {
  data: T | null
  fileUrl: string | null
  message: string
}

async function invokeAutomation<T>(name: string, body: Record<string, unknown>): Promise<AutomationResponse<T>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.functions.invoke<T>(name, { body })
    if (error) {
      console.error(`Automation ${name} failed`, error)
      return {
        data: null,
        fileUrl: null,
        message: 'Automation unavailable. Manual review required.',
      }
    }

    if (!data) {
      return {
        data: null,
        fileUrl: null,
        message: 'Automation returned no data.',
      }
    }

    return {
      data,
      fileUrl: (data as any).fileUrl ?? null,
      message: 'Automation completed',
    }
  } catch (error) {
    console.error(`Automation ${name} threw`, error)
    return {
      data: null,
      fileUrl: null,
      message: 'Automation unavailable. Manual review required.',
    }
  }
}

export async function runIntakeSummary(payload: Record<string, unknown>) {
  return invokeAutomation<{ summary: string; fileUrl?: string }>(REVENUE_CLARITY_FUNCTION, {
    stage: 'intake',
    ...payload,
  })
}

export async function runLeakScan(payload: Record<string, unknown>) {
  return invokeAutomation<{ leakMap: Record<string, unknown>; fileUrl?: string }>(REVENUE_CLARITY_FUNCTION, {
    stage: 'audit',
    ...payload,
  })
}

export async function runBlueprintGeneration(payload: Record<string, unknown>) {
  return invokeAutomation<{ interventions: unknown[]; fileUrl?: string }>(BLUEPRINT_FUNCTION, payload)
}

export async function runAdvisorSummary(payload: Record<string, unknown>) {
  return invokeAutomation<{ advisorSummary: string; fileUrl?: string }>(ADVISOR_FUNCTION, payload)
}

export async function runResultsReport(payload: Record<string, unknown>) {
  return invokeAutomation<{ reportUrl: string }>(REPORT_FUNCTION, payload)
}

export async function runProposal(payload: Record<string, unknown>) {
  return invokeAutomation<{ proposalUrl: string }>(PROPOSAL_FUNCTION, payload)
}
