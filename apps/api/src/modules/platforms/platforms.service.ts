import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'
import {
  CACHE_TTL,
  type ConnectAccountInput,
  type Platform,
  type PlatformStats,
} from '@forge/shared'
import { Platform as PrismaPlatform, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { LeetCodeProvider } from './providers/leetcode.provider'
import { CodeforcesProvider } from './providers/codeforces.provider'
import { GithubProvider } from './providers/github.provider'
import { PlatformFetchError, type PlatformProvider } from './providers/provider.interface'

@Injectable()
export class PlatformsService {
  private readonly providers: Record<Platform, PlatformProvider>

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    leetcode: LeetCodeProvider,
    codeforces: CodeforcesProvider,
    github: GithubProvider,
  ) {
    this.providers = {
      LEETCODE: leetcode,
      CODEFORCES: codeforces,
      GITHUB: github,
    }
  }

  async listAccounts(userId: string) {
    return this.prisma.codingAccount.findMany({
      where: { userId },
      include: {
        stats: { orderBy: { capturedAt: 'desc' }, take: 1 },
      },
    })
  }

  async connect(userId: string, input: ConnectAccountInput) {
    const provider = this.providers[input.platform]
    const valid = await provider.validateHandle(input.handle)
    if (!valid) {
      throw new BadRequestException(
        `Could not find "${input.handle}" on ${input.platform.toLowerCase()}`,
      )
    }

    return this.prisma.codingAccount.upsert({
      where: { userId_platform: { userId, platform: input.platform as PrismaPlatform } },
      update: { handle: input.handle, verified: true },
      create: {
        userId,
        platform: input.platform as PrismaPlatform,
        handle: input.handle,
        verified: true,
      },
    })
  }

  async disconnect(userId: string, platform: Platform) {
    const account = await this.prisma.codingAccount.findUnique({
      where: { userId_platform: { userId, platform: platform as PrismaPlatform } },
    })
    if (!account) throw new NotFoundException(`No ${platform} account connected`)
    await this.prisma.codingAccount.delete({ where: { id: account.id } })
    await this.cache.del(this.cacheKey(platform, account.handle))
    return { disconnected: platform }
  }

  /** Fetch fresh (or cached) stats, persisting a snapshot when fresh. */
  async getStats(userId: string, platform: Platform): Promise<PlatformStats> {
    const account = await this.prisma.codingAccount.findUnique({
      where: { userId_platform: { userId, platform: platform as PrismaPlatform } },
    })
    if (!account) throw new NotFoundException(`No ${platform} account connected`)

    const key = this.cacheKey(platform, account.handle)
    const cached = await this.cache.get<PlatformStats>(key)
    if (cached) return cached

    const accessToken = platform === 'GITHUB' ? await this.getGithubAccessToken(userId) : undefined

    try {
      const stats = await this.providers[platform].fetchStats(account.handle, accessToken)

      await this.prisma.platformStats.create({
        data: {
          codingAccountId: account.id,
          rating: stats.rating,
          maxRating: stats.maxRating,
          rank: stats.rank,
          solvedCount: stats.solvedCount,
          streak: stats.streak,
          details: stats.details as Prisma.InputJsonValue,
          capturedAt: stats.capturedAt,
        },
      })

      await this.cache.set(key, stats, CACHE_TTL.platformStats * 1000)
      return stats
    } catch (error) {
      if (error instanceof PlatformFetchError) {
        throw new BadGatewayException(error.message)
      }
      throw error
    }
  }

  private async getGithubAccessToken(userId: string): Promise<string | null> {
    const account = await this.prisma.account.findFirst({
      where: { userId, provider: 'github' },
      select: { access_token: true },
    })
    return account?.access_token ?? null
  }

  private cacheKey(platform: Platform, handle: string): string {
    return `stats:${platform}:${handle}`
  }
}
