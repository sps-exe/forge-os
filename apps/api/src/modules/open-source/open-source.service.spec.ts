import { describe, expect, it } from 'vitest'
import { OpenSourceService } from './open-source.service'

describe('OpenSourceService', () => {
  it('returns all curated open-source issues when no filter is provided', () => {
    const service = new OpenSourceService()
    const overview = service.getOverview()

    expect(overview.totalCount).toBeGreaterThan(0)
    expect(overview.languages).toContain('TypeScript')
    expect(overview.languages).toContain('Go')
  })

  it('filters issues correctly when language parameter is specified', () => {
    const service = new OpenSourceService()
    const tsOverview = service.getOverview('TypeScript')
    const rustOverview = service.getOverview('Rust')

    expect(tsOverview.issues.every((i) => i.language === 'TypeScript')).toBe(true)
    expect(rustOverview.issues.every((i) => i.language === 'Rust')).toBe(true)
  })
})
