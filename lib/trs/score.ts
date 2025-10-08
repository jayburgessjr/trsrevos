type MetricKey =
  | 'margin'
  | 'nrr'
  | 'churn'
  | 'cac'
  | 'payback'
  | 'forecastMape'
  | 'velocity'
  | 'incidents'

type MetricConfig = {
  label: string
  weight: number
  direction: 'higher-is-better' | 'lower-is-better'
  bounds: { min: number; max: number }
}

export type TrsScoreBand = 'RED' | 'YELLOW' | 'GREEN'

export type TrsScoreDriver = {
  name: string
  delta: number
}

export type TrsScoreInputs = {
  cac: number
  nrr: number
  churn: number
  payback: number
  margin: number
  forecastMape: number
  velocity: number
  incidents: number
}

export type TrsScoreResult = {
  score: number
  band: TrsScoreBand
  drivers: TrsScoreDriver[]
}

const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  margin: {
    label: 'Gross Margin',
    weight: 25,
    direction: 'higher-is-better',
    bounds: { min: 0, max: 80 }
  },
  nrr: {
    label: 'Net Revenue Retention',
    weight: 20,
    direction: 'higher-is-better',
    bounds: { min: 90, max: 130 }
  },
  churn: {
    label: 'Gross Churn',
    weight: 20,
    direction: 'lower-is-better',
    bounds: { min: 0, max: 12 }
  },
  cac: {
    label: 'CAC Efficiency',
    weight: 15,
    direction: 'lower-is-better',
    bounds: { min: 2, max: 6 }
  },
  payback: {
    label: 'Payback Period',
    weight: 10,
    direction: 'lower-is-better',
    bounds: { min: 6, max: 18 }
  },
  forecastMape: {
    label: 'Forecast Accuracy',
    weight: 10,
    direction: 'lower-is-better',
    bounds: { min: 5, max: 25 }
  },
  velocity: {
    label: 'Sales Velocity',
    weight: 0,
    direction: 'higher-is-better',
    bounds: { min: 0.5, max: 2.5 }
  },
  incidents: {
    label: 'Operational Incidents',
    weight: 0,
    direction: 'lower-is-better',
    bounds: { min: 0, max: 6 }
  }
}

const TOTAL_WEIGHT = Object.values(METRIC_CONFIG).reduce(
  (total, metric) => total + metric.weight,
  0
)

function clamp(value: number, min: number, max: number): number {
  if (min === max) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function normalizeValue(value: number, config: MetricConfig): number {
  const { min, max } = config.bounds
  if (min === max) {
    return 50
  }

  const clamped = clamp(value, min, max)
  const ratio = (clamped - min) / (max - min)
  const normalized =
    config.direction === 'higher-is-better' ? ratio * 100 : (1 - ratio) * 100

  return clamp(Number(normalized.toFixed(2)), 0, 100)
}

function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1))
}

function determineBand(score: number): TrsScoreBand {
  if (score >= 70) {
    return 'GREEN'
  }
  if (score >= 60) {
    return 'YELLOW'
  }
  return 'RED'
}

export function computeTrsScore(inputs: TrsScoreInputs): TrsScoreResult {
  const normalizedPerMetric: Record<MetricKey, number> = {
    margin: normalizeValue(inputs.margin, METRIC_CONFIG.margin),
    nrr: normalizeValue(inputs.nrr, METRIC_CONFIG.nrr),
    churn: normalizeValue(inputs.churn, METRIC_CONFIG.churn),
    cac: normalizeValue(inputs.cac, METRIC_CONFIG.cac),
    payback: normalizeValue(inputs.payback, METRIC_CONFIG.payback),
    forecastMape: normalizeValue(inputs.forecastMape, METRIC_CONFIG.forecastMape),
    velocity: normalizeValue(inputs.velocity, METRIC_CONFIG.velocity),
    incidents: normalizeValue(inputs.incidents, METRIC_CONFIG.incidents)
  }

  const weightedSum = (Object.keys(normalizedPerMetric) as MetricKey[]).reduce((total, key) => {
    const config = METRIC_CONFIG[key]
    if (config.weight === 0) {
      return total
    }
    return total + normalizedPerMetric[key] * config.weight
  }, 0)

  const score =
    TOTAL_WEIGHT > 0 ? roundToSingleDecimal(weightedSum / TOTAL_WEIGHT) : 0

  const drivers: TrsScoreDriver[] = (Object.keys(normalizedPerMetric) as MetricKey[])
    .map((key) => {
      const config = METRIC_CONFIG[key]
      const delta = roundToSingleDecimal(normalizedPerMetric[key] - 50)
      return { name: config.label, delta }
    })
    .sort((a, b) => {
      const magnitudeDifference = Math.abs(b.delta) - Math.abs(a.delta)
      if (magnitudeDifference !== 0) {
        return magnitudeDifference
      }
      return a.name.localeCompare(b.name)
    })

  return {
    score,
    band: determineBand(score),
    drivers
  }
}

export const trsMetricConfig = METRIC_CONFIG
