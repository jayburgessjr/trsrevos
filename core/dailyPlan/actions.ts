"use server"

import { computeDailyPlan, getDailyPlan, lockDailyPlan, getFocusBlocks } from "./service"
import { emitEvent } from "@/core/events/emit"

const USER = "me"
const ORG = "org"

export async function actionComputePlan() {
  const p = computeDailyPlan(USER, ORG)
  await emitEvent(USER, "daily_plan", "computed", { dateISO: p.dateISO, count: p.items.length })
  return p
}

export async function actionGetPlan() {
  return getDailyPlan(USER)
}

export async function actionLockPlan() {
  const p = lockDailyPlan(USER)
  if (p) await emitEvent(USER, "daily_plan", "locked", { dateISO: p.dateISO })
  return p
}

export async function actionGetFocus() {
  return getFocusBlocks(USER)
}
