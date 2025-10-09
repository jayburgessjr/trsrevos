import { DailyPlan, PriorityItem } from "./types"
import { priorityScore } from "./score"

const PLANS = new Map<string, DailyPlan>()
const FOCUS = new Map<string, Array<{ start: string; end: string }>>()

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function candidates(userId: string): PriorityItem[] {
  return [
    {
      id: "p1",
      title: "Send proposal to ACME",
      expectedImpact: 12000,
      effortHours: 1,
      probability: 0.6,
      urgency: 0.9,
      confidence: 0.8,
      strategicWeight: "Brilliant",
      nextAction: "Finalize terms and send",
      moduleHref: "/pipeline",
    },
    {
      id: "p2",
      title: "Price rule: raise Plus 5%",
      expectedImpact: 4000,
      effortHours: 0.5,
      probability: 0.7,
      urgency: 0.7,
      confidence: 0.7,
      strategicWeight: "Incremental",
      nextAction: "Apply guardrail in Pricing",
      moduleHref: "/pricing",
    },
    {
      id: "p3",
      title: "Collect on invoice #882",
      expectedImpact: 3500,
      effortHours: 0.3,
      probability: 0.9,
      urgency: 1.0,
      confidence: 0.9,
      strategicWeight: "Stabilization",
      nextAction: "Send dunning + call AP",
      moduleHref: "/finance",
    },
    {
      id: "p4",
      title: "Prep partner intro deck",
      expectedImpact: 8000,
      effortHours: 2,
      probability: 0.5,
      urgency: 0.6,
      confidence: 0.6,
      strategicWeight: "Incremental",
      nextAction: "Outline 5 slides",
      moduleHref: "/partners",
    },
    {
      id: "p5",
      title: "Follow up yesterday's demo",
      expectedImpact: 5000,
      effortHours: 0.5,
      probability: 0.55,
      urgency: 0.8,
      confidence: 0.7,
      strategicWeight: "Incremental",
      nextAction: "Send summary + next steps",
      moduleHref: "/pipeline",
    },
    {
      id: "p6",
      title: "Fix discount leakage",
      expectedImpact: 7000,
      effortHours: 1.5,
      probability: 0.65,
      urgency: 0.7,
      confidence: 0.6,
      strategicWeight: "Stabilization",
      nextAction: "Add floor-price rule",
      moduleHref: "/pricing",
    },
  ]
}

export function computeDailyPlan(userId: string, orgId?: string): DailyPlan {
  const dateISO = todayISO()
  const key = `${userId}:${dateISO}`
  const ranked = candidates(userId)
    .map((i) => ({ i, s: priorityScore(i) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 7)
    .map((x) => x.i)
  const plan: DailyPlan = { id: key, userId, orgId, dateISO, items: ranked, lockedAt: null }
  PLANS.set(key, plan)
  return plan
}

export function getDailyPlan(userId: string) {
  return PLANS.get(`${userId}:${todayISO()}`) ?? null
}

export function lockDailyPlan(userId: string) {
  const key = `${userId}:${todayISO()}`
  const p = PLANS.get(key)
  if (!p) return null
  p.lockedAt = new Date().toISOString()
  PLANS.set(key, p)
  const now = new Date()
  const s1 = new Date(now.getTime() + 5 * 60 * 1000)
  const e1 = new Date(s1.getTime() + 50 * 60 * 1000)
  const s2 = new Date(e1.getTime() + 15 * 60 * 1000)
  const e2 = new Date(s2.getTime() + 50 * 60 * 1000)
  FOCUS.set(key, [
    { start: s1.toISOString(), end: e1.toISOString() },
    { start: s2.toISOString(), end: e2.toISOString() },
  ])
  return p
}

export function getFocusBlocks(userId: string) {
  return FOCUS.get(`${userId}:${todayISO()}`) ?? []
}
