import { PriorityItem } from './types'

type PriorityInputs = Pick<
  PriorityItem,
  'expectedImpact' | 'probability' | 'strategicWeight' | 'urgency' | 'confidence' | 'effort'
>

export function calculatePriorityScore(inputs: PriorityInputs) {
  const numerator =
    inputs.expectedImpact *
    inputs.probability *
    inputs.strategicWeight *
    inputs.urgency *
    inputs.confidence
  const effort = inputs.effort <= 0 ? 1 : inputs.effort
  const score = numerator / effort
  return Number.isFinite(score) ? Number(score.toFixed(2)) : 0
}
