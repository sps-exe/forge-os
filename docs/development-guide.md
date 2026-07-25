# Forge Development Guide

This guide explains how to work in the repo without rediscovering the project shape each time.

## Repo map

```text
apps/
  web/        Next.js app, Auth.js, React Query, UI routes
  api/        NestJS API, providers, caching, business logic
packages/
  database/   Prisma schema, migrations, generated client, seed
  shared/     Shared constants, Zod schemas, API response types
  ui/         Shared Tailwind components and visual primitives
  config/     Shared tsconfig, ESLint, Tailwind presets
```

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Fill `AUTH_SECRET`, GitHub OAuth credentials, and Google OAuth credentials.
4. Start Postgres and Redis with `docker compose up -d`.
5. Run `pnpm db:generate`, then `pnpm db:migrate`, then `pnpm db:seed`.
6. Start the monorepo with `pnpm dev`.

The web app runs at `http://localhost:3100`. The API runs at `http://localhost:3101/api/v1`.

The monorepo uses a root `.env`. The API loads it directly through Nest config, and the web app loads it from `apps/web/next.config.ts`, so local development should not require duplicate app-level env files.

## Important conventions

- Prefer shared schemas and types from `@forge/shared` for request/response contracts.
- Keep API responses inside the standard `ApiResponse<T>` envelope.
- API successes are wrapped by `TransformInterceptor`.
- API errors are wrapped by `HttpExceptionFilter` using shared `ErrorCodes`.
- Validate API bodies with `ZodValidationPipe` and shared Zod schemas where possible.
- Keep platform provider data normalized into `PlatformStats`; put provider-specific data in `details`.
- Do not call external platform APIs directly from React components. Route through the Nest API.
- Treat GitHub as OAuth-managed in the UI because contribution data requires the user's GitHub token.
- Keep Redis TTLs in `packages/shared/src/constants.ts`.

## Frontend notes

- Auth-protected pages live under `apps/web/app/(app)`.
- `apps/web/app/(app)/layout.tsx` is the server-side auth gate for app pages.
- Client API calls use `apps/web/lib/api/client.ts`.
- React Query hooks live in `apps/web/lib/api/hooks.ts`.
- Shell navigation lives in `apps/web/components/shell/sidebar.tsx`.
- Shared visual components should go in `packages/ui/src/components`.
- App-specific page composition should stay under `apps/web`.

## Backend notes

- `AppModule` wires config, throttling, Prisma, cache, auth, users, platforms, contests, tasks, achievements, notifications, quests, open-source, and revision.
- `PlatformsService` is the orchestrator for account linking, cache lookup, provider fetches, and stats snapshots.
- `TasksService` owns daily task generation (tailored by `PlatformStats`), task status updates, task history writes, no-double-XP checks, weekly momentum summaries, recent task history, streak milestone notifications, and weak-topic recommendations.
- `AchievementsService` computes badges from task, XP, account, and platform stat records, and persists unlock state to `UserAchievement` rows while emitting unlock notifications.
- `NotificationsService` manages in-app notifications (badge unlocks, streak milestones, quest completions).
- `QuestsService` computes weekly 7-day targets, evaluates metric progress, persists `UserQuest` completions, awards XP bonuses, and triggers `QUEST_COMPLETED` notifications.
- `OpenSourceService` handles open-source Good First Issues discovery filtered by language tags.
- `RevisionService` manages spaced-repetition revision cards (`RevisionItem`), interval calculation (1d → 3d → 7d → 14d → 30d), and review XP rewards.
- Provider classes should throw `PlatformFetchError` for external-platform failures so service code can convert them to `BadGatewayException`.
- `ContestsService` currently uses Codeforces live API data plus computed LeetCode weekly/biweekly contests.

## Database notes

- Prisma schema lives at `packages/database/prisma/schema.prisma`.
- Auth.js adapter models are part of the main schema.
- `CodingAccount` has one account per user/platform.
- `PlatformStats` stores time-series snapshots per connected coding account.
- `DailyTask`, `TaskHistory`, `XpEvent`, `UserAchievement`, and `Notification` are used by the daily loop, streak engine, achievements, and notification system.

## Verification

Use the narrowest useful command first:

- Shared/package tests: `pnpm --filter @forge/shared test`
- API tests: `pnpm --filter @forge/api test`
- Web type-check: `pnpm --filter @forge/web typecheck`
- Whole repo type-check: `pnpm typecheck`
- Whole repo tests: `pnpm test`
- Whole repo build: `pnpm build`

Provider tests already exist for LeetCode and Codeforces. Add or update tests when changing provider parsing, API contracts, auth guards, or cache behavior.

## Common change recipes

### Add a new API endpoint

1. Add or reuse a shared Zod schema and response type in `@forge/shared`.
2. Implement service behavior in the relevant Nest module.
3. Add controller route under the module.
4. Use `JwtAuthGuard` unless the endpoint is intentionally public.
5. Add frontend client method in `apps/web/lib/api/client.ts`.
6. Add React Query hook in `apps/web/lib/api/hooks.ts` if the UI consumes it.
7. Add focused tests.

### Add a new app page

1. Add the route under `apps/web/app/(app)` if auth is required.
2. Reuse shell/page components and `@forge/ui` primitives.
3. Use existing hooks rather than fetching manually.
4. Add navigation in `apps/web/components/shell/sidebar.tsx` when it is a top-level page.
5. Handle loading, empty, and disconnected states.

### Add a new platform

Follow the checklist in `docs/ai-context.md`. Platform support touches Prisma, shared schemas, provider registration, API behavior, and several UI surfaces.

### Extend daily tasks

1. Add or update task types in Prisma and `packages/shared/src/schemas/task.ts`.
2. Update task generation templates and XP mapping in `TasksService`.
3. Add UI labels/states in `apps/web/app/(app)/tasks/page.tsx`.
4. Keep `/tasks/summary` aligned with new completion/streak semantics.
5. Add service tests for XP, history, and edge cases.
6. Update `docs/roadmap.md` if the product behavior changes.

### Add achievements

1. Add the badge definition in `apps/api/src/modules/achievements/achievements.service.ts`.
2. Progress is derived from metrics, and new unlocks are persisted to `UserAchievement` rows with an automatically generated `Notification`.
3. Add or update API tests for earned, locked, persisted, and next-achievement behavior.
4. Update the dashboard card and `/achievements` page if the category or progress semantics change.
