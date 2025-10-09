"use server"

import { generateRecap } from "./service"
import { emitEvent } from "@/core/events/emit"

export async function actionGenerateRecap() {
  const r = generateRecap("me")
  await emitEvent("me", "recap", "generated", { dollars: r.dollars })
  return r
}
