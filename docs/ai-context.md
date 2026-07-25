# Forge AI Context

Use this file as the first stop for any future AI or contributor. Keep it updated whenever architecture, workflow, or product direction changes.

## Product intent

Forge is a daily operating system for software engineers. The current app brings coding platform activity into one dashboard: GitHub contributions, LeetCode progress, Codeforces ratings, and upcoming contests. The product direction is habit formation first, then tasks, XP, coaching, revision, and richer analytics.

The master product spec is broader than the current codebase. The finished product should eventually include daily tasks, contest reminders, GitHub/open-source discovery, roadmaps, journal, revision, achievements, notifications, analytics, AI coaching, AI code review, and production SaaS hardening.

## Current implementation snapshot

- Monorepo managed by pnpm workspaces and Turborepo.
- `apps/web` is a Next.js 15 App Router app running on port `3100`.
- `apps/api` is a NestJS API running on port `3101`, with routes under `/api/v1`.
- `packages/database` owns Prisma schema, generated client, migrations, and seed.
- `packages/shared` owns cross-app constants, Zod schemas, DTO-ish types, API envelopes, and normalized platform shapes.
- `packages/ui` owns shared Tailwind/shadcn-style components and Forge-specific visual components.
- `packages/config` owns shared TypeScript, ESLint, and Tailwind configuration.
- Local infrastructure is Postgres 16 and Redis 7 from `docker-compose.yml`.

## Features that are wired end to end

- OAuth sign-in through Auth.js v5 using GitHub or Google.
- GitHub sign-in auto-connects the user's GitHub coding account when the provider profile exposes a login.
- Web clients request a short-lived API bearer token from `apps/web/app/api/token/route.ts`.
- The API verifies that token with `JwtAuthGuard` and uses `CurrentUser` to access `{ id, email }`.
- Users can view and edit basic profile data through the users module.
- Users can connect LeetCode and Codeforces handles from the connections page.
- Users can disconnect LeetCode and Codeforces handles. GitHub is treated as OAuth-managed in the UI.
- Dashboard shows profile/XP shell, GitHub contribution stats, platform cards, and contests.
- Platform detail pages exist for LeetCode, Codeforces, and GitHub.
- Contest aggregation combines Codeforces API data with a deterministic LeetCode contest schedule.
- External platform stats are normalized, cached in Redis, and snapshotted to Postgres.
- Daily tasks are generated deterministically from prepared task types and can be completed/skipped for XP.
- Task momentum summary tracks current developer streak, active days, and weekly task completion from `DailyTask` records.
- Task history shows the last 14 generated task days from `DailyTask` records.
- Achievements are computed badges based on XP, task completion/streaks, connected platforms, and latest platform stats.
- Achievement unlocks are persisted to `UserAchievement` rows and stamped with `unlockedAt`; newly unlocked badges trigger an `ACHIEVEMENT_UNLOCKED` notification.
- An in-app notification centre (`GET /api/v1/notifications`) lists recent notifications. `PATCH /:id/read` and `POST /read-all` mark them read.
- Completing a task at a streak milestone (3/7/14/30 days) fires a `STREAK_MILESTONE` notification automatically.
- The topbar has a `NotificationBell` component showing an unread count badge and a dropdown panel.
- `/settings/profile` allows editing `displayName`, `bio`, and `timezone`. `/settings` redirects there.
- `/quests` tracks weekly 7-day targets (Task Crusher, XP Surge, Rhythm Master, Multi-Platform), awards bonus XP payouts on completion, persists `UserQuest` records, and fires `QUEST_COMPLETED` notifications.
- Daily tasks dynamically tailor problem difficulty and titles based on connected platform metrics (Codeforces rating, LeetCode solved count, GitHub streak).
- `/tasks` includes a `TopicRecommendationsCard` displaying stats-tailored focus areas and difficulty levels.
- `/open-source` allows developers to discover curated Good First Issues and beginner-friendly repos filtered by programming language (TypeScript, Python, Go, Rust).
- `/contests` supports Google Calendar event creation and `.ics` (iCal) export downloads for upcoming rounds.
- `/revision` powers spaced-repetition learning memory cards with optimal review schedules (1d → 3d → 7d → 14d → 30d), awarding +10 XP per review.

## Features that are only partially prepared

- Daily tasks, developer streaks, weekly quests, achievements, and in-app notifications are implemented; streak recovery and AI-driven personalized recommendation logic are future work.
- AI coaching, journal, and spaced repetition are future Phase 3 roadmap items.

### Daily tasks and XP

1. The UI calls `/tasks/today`, which ensures today's deterministic task list exists.
2. `TasksService` creates one task per prepared task type for the current UTC day.
3. Completing a task records `TaskHistory` and creates an `XpEvent` if that user/task type/day was not already completed.
4. `UsersService.getMe` aggregates `XpEvent` records to return `totalXp` and level.
5. `/tasks/summary` derives weekly momentum and current streak from completed daily tasks.
6. `/tasks/history` returns the last 14 days of task rows grouped by day.
7. Current task generation is intentionally deterministic; AI recommendations should later build on top of task/history/profile data.

### Achievements

1. `GET /api/v1/achievements` computes badge progress from existing user data.
2. Achievements are currently derived, not persisted; there is no unlock timestamp yet.
3. Badge inputs include connected accounts, total XP, completed task count, current task streak, today's completion rate, LeetCode solved count, Codeforces rating, and GitHub streak.
4. The dashboard shows a compact achievement card, and `/achievements` shows the full badge grid.

## Critical flows

### Auth and API access

1. User signs in in the web app with GitHub or Google.
2. Auth.js stores Auth.js adapter records in Postgres using `@forge/database`.
3. Protected route group `apps/web/app/(app)/layout.tsx` calls `auth()` and redirects unauthenticated users to `/sign-in`.
4. Client-side API calls ask `/api/token` for a 15-minute API JWT.
5. `apps/web/lib/api/client.ts` caches that token for 12 minutes and sends it as `Authorization: Bearer ...`.
6. Nest `JwtAuthGuard` validates the token with the shared `AUTH_SECRET`.

### Platform stats

1. The UI calls hooks in `apps/web/lib/api/hooks.ts`.
2. Hooks call `apps/web/lib/api/client.ts`, which expects the API response envelope from `@forge/shared`.
3. `PlatformsController` routes requests to `PlatformsService`.
4. `PlatformsService` looks up the user's connected `CodingAccount`.
5. The service checks Redis using `stats:${platform}:${handle}`.
6. On a cache miss, the relevant provider fetches external data and returns normalized `PlatformStats`.
7. The service persists a `PlatformStats` snapshot and caches the normalized response.

### Adding another coding platform

Update all of these together:

- Prisma `Platform` enum in `packages/database/prisma/schema.prisma`.
- `PLATFORMS` and `PLATFORM_LABELS` in `packages/shared/src/constants.ts`.
- Zod/platform-specific details schemas in `packages/shared/src/schemas/platform.ts`.
- A provider implementing `PlatformProvider` in `apps/api/src/modules/platforms/providers`.
- Provider injection and provider map in `PlatformsModule` and `PlatformsService`.
- API tests for provider behavior and service orchestration.
- Web API typing, connection UI, navigation/sidebar, dashboard card, and detail page.

## Development commands

- Install: `pnpm install`
- Start services: `docker compose up -d`
- Generate Prisma client: `pnpm db:generate`
- Apply migrations: `pnpm db:migrate`
- Seed: `pnpm db:seed`
- Run all dev servers: `pnpm dev`
- Build: `pnpm build`
- Type-check: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`

## Environment assumptions

The canonical local ports are:

- Web: `http://localhost:3100`
- API: `http://localhost:3101/api/v1`
- Postgres host port: `5433`
- Redis host port: `6379`

Use `.env.example` as the source of truth for required environment variables.

## Documentation maintenance rule

When changing the project, update these docs in the same change:

- `docs/ai-context.md` for current product/system facts and handoff context.
- `docs/development-guide.md` for setup, commands, verification, and conventions.
- `docs/roadmap.md` for feature status, planned work, and sequencing.
- `docs/architecture.md` for structural flows, API conventions, and data-flow diagrams.
