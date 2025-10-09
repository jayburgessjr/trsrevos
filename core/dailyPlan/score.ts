import { PriorityItem } from "./types"

export function priorityScore(i: PriorityItem) {
  const w = i.strategicWeight === "Brilliant" ? 1.2 : i.strategicWeight === "Incremental" ? 1.0 : 0.9
  return (i.expectedImpact * i.probability * w * i.urgency * i.confidence) / Math.max(i.effortHours, 0.25)
}
