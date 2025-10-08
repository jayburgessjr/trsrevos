import { describe, it, expect } from 'vitest'

function band(score: number) {
  if (score < 60) return 'RED'
  if (score < 70) return 'YELLOW'
  return 'GREEN'
}

describe('TRS banding', () => {
  it('reds under 60', () => { expect(band(59)).toBe('RED') })
  it('yellow 60-69', () => { expect(band(65)).toBe('YELLOW') })
  it('green 70+', () => { expect(band(72)).toBe('GREEN') })
})
