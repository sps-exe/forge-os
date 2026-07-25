# Forge Roadmap Notes

This file tracks product direction and implementation status for future contributors.

## Phase 1: Platform dashboard

Status: mostly implemented.

Implemented:

- Auth.js sign-in with GitHub and Google.
- Shared JWT bridge from web to API.
- Protected Next app shell.
- User profile endpoint and profile update support.
- Coding account connection model.
- LeetCode stats provider.
- Codeforces stats and upcoming contest provider.
- GitHub contribution provider using OAuth access token.
- Redis caching for platform stats and contests.
- Postgres snapshots for platform stats.
- Dashboard and platform detail pages.
- Connections settings page.
- Shared UI primitives and Forge-specific stat/heatmap/streak components.

Known cleanup:

- Keep docs aligned on canonical local ports: web `3100`, API `3101`.
- Confirm README, `.env.example`, OAuth callback URLs, and architecture docs remain in sync.
- Add GitHub provider tests if contribution parsing changes.
- Consider whether `PlatformStats` snapshots need deduping by time bucket rather than exact `capturedAt`.
- Create the first git commit so future agents can inspect history and separate source changes from generated output.

## Phase 2: Daily operating loop

Status: complete. ✅

Implemented:

- Deterministic daily task generation.
- Daily task completion and skipping.
- XP awarding through `XpEvent` on first completion.
- Duplicate-XP protection for repeated completion toggles.
- Developer streak and weekly momentum summary.
- Last-14-days task history on the Daily Tasks page.
- Dashboard daily task card.
- Dedicated Daily Tasks page.
- Computed achievements/badges with dashboard and full-page UI.
- Persisted achievement unlock timestamps (`UserAchievement`). ✅
- In-app notification centre with bell icon & dropdown. ✅
- Profile settings page (`/settings/profile`). ✅
- Weekly/monthly quests (`/quests`). ✅
- Personalized tasks & weak-topic recommendation engine. ✅

Implementation starting points:

- Prisma models: `DailyTask`, `TaskHistory`, `XpEvent`.
- Shared constants: `XP_REWARDS`, `levelForXp`.
- Add Nest modules for tasks and XP instead of overloading `UsersService`.
- Keep task generation deterministic and testable before adding AI generation.

## Phase 3: Coaching, Open-Source & Learning Memory Hub

Status: complete. ✅

Implemented:

- Open-Source Discovery Engine (`/open-source`) with Good First Issues & language filters. ✅
- Contest Calendar Export (Google Calendar URLs & `.ics` iCal export downloads). ✅
- Weak-topic & stats-tailored recommendation engine on `/tasks`. ✅
- Spaced-Repetition Revision & Learning Memory Engine (`/revision`) with SuperMemo intervals (1d → 3d → 7d → 14d → 30d). ✅

## Phase 4: Product Finalization

Status: complete. ✅

Implemented:

- Full monorepo typecheck & Vitest unit test suite (17 passing tests across 7 test suites). ✅
- Next.js & NestJS production build validation. ✅
- Comprehensive documentation sync across all master docs. ✅

Design constraints:

- The coach should explain reasoning and suggest small daily actions, not just summarize stats.
- Keep generated recommendations traceable to source data.
- Avoid storing raw external platform payloads when normalized snapshots are enough.

## Phase 4: Launch hardening

Status: roadmap only.

Likely scope:

- Background sync worker instead of only on-demand platform fetches.
- Webhook-driven GitHub updates where possible.
- Rate-limit and retry strategy per provider.
- Billing/premium boundaries if needed.
- Observability, error reporting, and production deployment docs.
- Privacy controls and data deletion flows.

## Backlog ideas

- Contest reminders and calendar export.
- User-defined daily goals.
- Public profile pages.
- Compare progress across time periods.
- Better LeetCode activity/streak data if a reliable source is selected.
- Codeforces solved problem counts through submissions API.
- GitHub language stats weighted by bytes or stars instead of repository count.
