import { describe, expect, it } from 'vitest'
import { levelForXp } from './constants'

describe('levelForXp', () => {
  it('starts at level 1 with zero XP', () => {
    expect(levelForXp(0)).toMatchObject({ level: 1, currentXp: 0 })
  })

  it('advances to level 2 at 100 XP', () => {
    const result = levelForXp(100)
    expect(result.level).toBe(2)
    expect(result.currentXp).toBe(0)
  })

  it('reports progress within a level', () => {
    // Level 2 threshold is 100, level 3 is 400 → 250 is midway through level 2.
    const result = levelForXp(250)
    expect(result.level).toBe(2)
    expect(result.currentXp).toBe(150)
    expect(result.nextLevelXp).toBe(300)
  })

  it('scales with the n^2 curve', () => {
    expect(levelForXp(900).level).toBe(4) // 3^2*100 = 900
    expect(levelForXp(1600).level).toBe(5) // 4^2*100 = 1600
  })
})
