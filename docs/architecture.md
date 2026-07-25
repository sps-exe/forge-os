# Forge — Architecture (Phase 1)

## Overview

```
┌─────────────┐     JWT (HS256, shared AUTH_SECRET)    ┌──────────────┐
│  Next.js    │ ──────────────────────────────────────▶│   NestJS     │
│  web :3100  │                                         │   api :3101  │
│             │◀────────── ApiResponse<T> envelope ─────│              │
│  Auth.js    │                                         │  Providers   │
│  React Query│                                         │  Redis cache │
└─────┬───────┘                                         └──────┬───────┘
      │                                                        │
      │ Prisma (adapter)                          Prisma       │
      ▼                                                        ▼
                        ┌───────────────────┐
                        │   PostgreSQL 16   │
                        └───────────────────┘
      external: leetcode.com/graphql · codeforces.com/api · api.github.com
```

## Auth flow

1. User signs in on the **web app** via Auth.js (GitHub or Google OAuth).
2. Auth.js persists the account (incl. the GitHub OAuth `access_token`) through
   the Prisma adapter and issues a session JWT.
3. When the client needs to call the API, it fetches a **15-minute API token**
   from `/api/token` (a route handler that re-signs a minimal JWT with the
   shared `AUTH_SECRET`).
4. The **NestJS `JwtAuthGuard`** verifies that token and attaches `{ id, email }`
   to the request.

Rationale: the Edge middleware can't run the Prisma adapter, so route
protection uses a lightweight session-cookie check and the real session
validation happens in the `(app)` server layout.

## API conventions

- All routes are prefixed `/api/v1` (URI versioning).
- Every success is wrapped in `{ success: true, data }` (`TransformInterceptor`).
- Every error is wrapped in `{ success: false, error: { code, message } }`
  (`HttpExceptionFilter`), with codes from `@forge/shared`'s `ErrorCodes`.
- Request bodies are validated with `ZodValidationPipe` against shared schemas.
- Throttling: 100 req/min globally (`@nestjs/throttler`).

## Platform integrations

Each integration implements `PlatformProvider`:

```ts
interface PlatformProvider {
  validateHandle(handle: string): Promise<boolean>
  fetchStats(handle: string, accessToken?: string | null): Promise<PlatformStats>
}
```

| Platform   | Source                   | Auth needed        |
| ---------- | ------------------------ | ------------------ |
| LeetCode   | `leetcode.com/graphql`   | none (public)      |
| Codeforces | `codeforces.com/api`     | none (public)      |
| GitHub     | `api.github.com/graphql` | user's OAuth token |

`PlatformsService` orchestrates: check Redis → fetch via provider → snapshot to
`platform_stats` → cache in Redis (`CACHE_TTL.platformStats`). GitHub pulls the
user's stored OAuth token from the `accounts` table for the GraphQL contribution
calendar query.

## Data model

See `packages/database/prisma/schema.prisma`. Phase 1 tables: `User`, `Account`,
`Session`, `Profile`, `CodingAccount`, `PlatformStats`. Phase 2 tables:
`DailyTask`, `TaskHistory`, `XpEvent`, `UserAchievement`, `Notification`, `UserQuest`, `RevisionItem`.

- `UserAchievement` — persists `(userId, achievementId, unlockedAt)` when a badge is first earned.
- `Notification` — in-app notification row with `type` (enum), `title`, `body`, `read` flag.
- `UserQuest` — persists `(userId, questId, weekKey, xpAwarded, completedAt)` when a weekly quest is completed.
- `RevisionItem` — tracks saved revision cards, `nextReviewAt`, `intervalDays` (1d → 3d → 7d → 14d → 30d), and `reviewCount`.

## Spaced-Repetition Revision Engine

`RevisionService` (`GET /api/v1/revision`, `POST /api/v1/revision`, `POST /api/v1/revision/:id/review`) manages spaced-repetition memory cards, advances review intervals upon completion, awards XP, and feeds due cards into the developer's daily workflow.


## Living handoff docs

Future agents should read `docs/ai-context.md` first, then `docs/development-guide.md`
for local workflow and conventions, and `docs/roadmap.md` for feature status.
When a change alters product scope, ports, auth, data flow, platform integration,
or planned sequencing, update those files in the same change.

## Caching strategy

| Data            | TTL    |
| --------------- | ------ |
| Platform stats  | 15 min |
| Contests        | 30 min |
| GitHub activity | 10 min |

## Contest aggregation & Calendar Export

`ContestsService` merges Codeforces' `contest.list` API with a deterministic
computation of LeetCode's fixed weekly/biweekly schedule (LeetCode has no public
contest API), then caches the merged, sorted result. The UI allows direct Google Calendar URL generation and `.ics` iCal file downloads for every upcoming contest.

## Open-Source Discovery Engine

`OpenSourceService` (`GET /api/v1/open-source`) provides curated Good First Issues and beginner-friendly contributions filtered by programming language (`TypeScript`, `Python`, `Go`, `Rust`).

## Daily task loop

`TasksService` inspects connected platform snapshots (`PlatformStats`) to dynamically tailor task titles, difficulty targets (e.g. Codeforces target rating, LeetCode difficulty tier), and generates weak-topic recommendations (`TopicRecommendation`). `TasksService.updateStatus` marks task completion, awards XP via an `XpEvent`, fires streak milestone notifications, and returns an updated `DailyTasksOverview`.

## Achievements

`AchievementsService` computes badge progress from existing records rather than
persisting unlocks yet. The first badge set covers daily task habits, XP totals,
connected platforms, LeetCode solved count, Codeforces rating, and GitHub
contribution streak. This keeps the gamification layer immediately useful while
leaving room for persisted unlock timestamps, notifications, and public profile
badges later.

## Future improvements

- Move token issuance to httpOnly cookie + refresh rotation.
- Background sync worker (BullMQ) instead of on-demand fetch.
- Webhook-driven GitHub updates rather than polling.
