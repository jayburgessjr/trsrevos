import { describe, expect, it } from 'vitest'

import { computeTrsScore } from '../lib/trs/score'

const higherIsBetter = (normalized: number, min: number, max: number) =>
  min + (normalized / 100) * (max - min)

const lowerIsBetter = (normalized: number, min: number, max: number) =>
  min + (1 - normalized / 100) * (max - min)

const buildInputs = (normalized: number) => ({
  cac: lowerIsBetter(normalized, 2, 6),
  nrr: higherIsBetter(normalized, 90, 130),
  churn: lowerIsBetter(normalized, 0, 12),
  payback: lowerIsBetter(normalized, 6, 18),
  margin: higherIsBetter(normalized, 0, 80),
  forecastMape: lowerIsBetter(normalized, 5, 25),
  velocity: higherIsBetter(50, 0.5, 2.5),
  incidents: lowerIsBetter(50, 0, 6)
})

describe('computeTrsScore', () => {
  it('classifies 59 as RED', () => {
    const result = computeTrsScore(buildInputs(59))
    expect(result.score).toBeCloseTo(59, 1)
    expect(result.band).toBe('RED')
  })

  it('classifies 60–69 as YELLOW', () => {
    const sixty = computeTrsScore(buildInputs(60))
    const sixtyNine = computeTrsScore(buildInputs(69))

    expect(sixty.score).toBeCloseTo(60, 1)
    expect(sixty.band).toBe('YELLOW')

    expect(sixtyNine.score).toBeCloseTo(69, 1)
    expect(sixtyNine.band).toBe('YELLOW')
  })

  it('classifies 70 and above as GREEN', () => {
    const seventy = computeTrsScore(buildInputs(70))
    expect(seventy.score).toBeCloseTo(70, 1)
    expect(seventy.band).toBe('GREEN')
  })

  it('orders drivers by absolute delta impact and keeps tie-break order stable', () => {
    const inputs = {
      ...buildInputs(65),
      margin: higherIsBetter(92, 0, 80),
      churn: lowerIsBetter(20, 0, 12),
      forecastMape: lowerIsBetter(40, 5, 25),
      cac: lowerIsBetter(48, 2, 6),
      velocity: higherIsBetter(80, 0.5, 2.5),
      incidents: lowerIsBetter(30, 0, 6)
    }

    const result = computeTrsScore(inputs)
    const drivers = result.drivers

    expect(drivers[0].name).toBe('Gross Margin')
    expect(Math.abs(drivers[0].delta)).toBeGreaterThan(Math.abs(drivers[1].delta))

    for (let index = 1; index < drivers.length; index += 1) {
      expect(Math.abs(drivers[index - 1].delta)).toBeGreaterThanOrEqual(
        Math.abs(drivers[index].delta)
      )
    }
  })
})
