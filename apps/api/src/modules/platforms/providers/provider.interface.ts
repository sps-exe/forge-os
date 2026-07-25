import type { PlatformStats } from '@forge/shared'

/**
 * Every coding platform integration implements this interface.
 * `fetchStats` returns a normalized snapshot; provider-specific data
 * goes into `details`.
 */
export interface PlatformProvider {
  /** Verify the handle exists on the platform. */
  validateHandle(handle: string): Promise<boolean>
  /** Fetch a normalized stats snapshot for the handle. */
  fetchStats(handle: string, accessToken?: string | null): Promise<PlatformStats>
}

export class PlatformFetchError extends Error {
  constructor(
    public readonly platform: string,
    message: string,
  ) {
    super(`[${platform}] ${message}`)
    this.name = 'PlatformFetchError'
  }
}
