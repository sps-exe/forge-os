# 🔥 Forge — The Daily Operating System for Software Engineers

[![Typecheck](https://img.shields.io/badge/typecheck-passing-success.svg)](#verification)
[![Tests](https://img.shields.io/badge/vitest-17%20passed-brightgreen.svg)](#verification)
[![License](https://img.shields.io/badge/license-Private-blue.svg)](#license)

**Forge** unifies LeetCode, Codeforces, and GitHub activity — plus daily operating checklists, weekly quests, spaced-repetition revision, in-app notifications, and open-source discovery — into one habit-forming developer dashboard.

> Build better software engineers through better daily habits.

---

## 🌟 Key Features

- **Multi-Platform Dashboard**: Real-time stats, rating progress, solved problem breakdowns, and contribution heatmaps for LeetCode, Codeforces, and GitHub.
- **Daily Operating Loop**: Stats-tailored daily tasks (`LEETCODE_DAILY`, `CODEFORCES_PRACTICE`, `GITHUB_CONTRIBUTION`, `CS_READING`, `REVISION`, `INTERVIEW_QUESTION`) with XP rewards and duplicate-XP protection.
- **Weak-Topic Recommendations**: Analyzes platform statistics to suggest targeted focus areas (e.g. Binary Search, Dynamic Programming, System Design).
- **Weekly Quests & Challenges (`/quests`)**: 7-day ISO week cycles with bonus XP payouts, progress bars, and completion tracking.
- **Spaced-Repetition Revision & Memory (`/revision`)**: Leitner/SuperMemo memory cards (`1d → 3d → 7d → 14d → 30d`) with +10 XP review rewards.
- **Open-Source Discovery Engine (`/open-source`)**: Curated Good First Issues & beginner-friendly repos filtered by programming language (TypeScript, Python, Go, Rust).
- **Contest Hub & Calendar Exports (`/contests`)**: Live contest feed with one-click **Google Calendar** event creation and **.ics (iCal)** file downloads.
- **Persisted Achievements (`/achievements`)**: Computed badges across Habit, Platform, and XP categories with persisted `UserAchievement` unlock timestamps.
- **In-App Notification Centre**: Shell topbar `NotificationBell` dropdown with unread badge count, type icons (🏆 / 🔥 / 🎯), and mark-read controls.
- **Profile & Connection Settings (`/settings`)**: Customizable display name, bio, timezone, and OAuth platform linking.

---

## 📁 Monorepo Layout

```text
forge/
├── apps/
│   ├── web/        # Next.js 15 (App Router) — Auth.js, React Query, UI routes
│   └── api/        # NestJS 11 — platform providers, quests, revision, notifications
├── packages/
│   ├── ui/         # Shared Tailwind design system & visual primitives
│   ├── database/   # Prisma schema, migrations, generated client, seed
│   ├── shared/     # Shared Zod schemas, DTO types, API response envelopes
│   └── config/     # Shared tsconfig, ESLint, Tailwind presets
├── docs/           # AI Context, Architecture, Development Guide, Roadmap
└── docker-compose.yml   # PostgreSQL 16 + Redis 7
```

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, React Query, Zustand |
| **Backend** | NestJS 11, Prisma 6, Redis (`cache-manager`) |
| **Database** | PostgreSQL 16 |
| **Auth & Security** | Auth.js v5 (GitHub + Google OAuth), JWT Bridge, HTTP Security Headers, Throttling |
| **Tooling** | pnpm workspaces, Turborepo, Vitest, ESLint, Prettier |

---

## 🔐 Security Architecture

- **Auth.js + Short-Lived JWT Bridge**: Web app issues a signed HS256 JWT using shared `AUTH_SECRET` verified by NestJS `JwtAuthGuard`.
- **Security HTTP Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `HSTS`, `Permissions-Policy` configured across Next.js and NestJS.
- **Input Validation**: All API payloads pass through `ZodValidationPipe` and NestJS `ValidationPipe` with whitelist enforcement.
- **Rate Limiting**: NestJS `@nestjs/throttler` limits API endpoints to 100 requests per minute per client.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`corepack enable`)
- Docker Desktop (for Postgres + Redis)

### Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in OAuth credentials
cp .env.example .env
#   → Generate AUTH_SECRET: openssl rand -base64 32
#   → Fill AUTH_GITHUB_ID & AUTH_GITHUB_SECRET
#   → Fill AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET

# 3. Start PostgreSQL 16 & Redis 7
docker compose up -d

# 4. Initialize Database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Start Development Server (Web :3100, API :3101)
pnpm dev
```

---

## 🧪 Verification & Testing

```bash
# Typecheck monorepo
pnpm typecheck

# Run API & shared unit tests
pnpm test

# Build production bundles
pnpm build
```

---

## 📚 Documentation & Handoff

- [`docs/ai-context.md`](docs/ai-context.md) — Architectural principles and codebase state.
- [`docs/architecture.md`](docs/architecture.md) — Component architecture, data flows, and schema models.
- [`docs/development-guide.md`](docs/development-guide.md) — Workflow recipes and testing instructions.
- [`docs/roadmap.md`](docs/roadmap.md) — Complete phase status and future roadmap.

---

## 📄 License

Private — Software Engineers Daily OS.
