# 🔥 Forge OS — The Daily Operating System for Software Engineers

[![Live App](https://img.shields.io/badge/Live%20Product-Forge%20OS-orange?style=for-the-badge&logo=rocket)](https://github.com/sps-exe/forge-os)
[![Built With Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Powered By NestJS](https://img.shields.io/badge/Backend-NestJS%2011-red?style=for-the-badge&logo=nestjs)](https://nestjs.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Security](https://img.shields.io/badge/Security-Hardened%20JWT%20%2B%20Headers-green?style=for-the-badge&logo=shield)](SECURITY.md)

> **Forge OS** unifies competitive programming metrics, coding streak engines, spaced-repetition memory cards, weekly quests, and contest feeds into one daily habit-forming operating system for software engineers.

---

## 🌟 What is Forge OS?

Software engineers manage their practice across fragmented tools — LeetCode for problem solving, Codeforces for contest rating, GitHub for contribution streaks, custom note apps for revision, and calendar apps for contest schedules.

**Forge OS** consolidates this entire workflow into a single, cohesive operating loop:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              FORGE OS                                  │
 ├──────────────────┬──────────────────┬─────────────────┬────────────────┤
 │  PLATFORMS HUB   │   DAILY LOOP     │  MEMORY ENGINE  │   QUEST HUB    │
 │  • LeetCode      │   • Dynamic Tasks│  • Spaced Rep.  │   • 7-Day Goals│
 │  • Codeforces    │   • Weak Topics  │  • SuperMemo    │   • XP Bonuses │
 │  • GitHub        │   • XP Rewards   │  • Problem Cards│   • Badges     │
 └──────────────────┴──────────────────┴─────────────────┴────────────────┘
```

---

## 🚀 Live Product Capabilities

### 📊 1. Unified Multi-Platform Analytics Dashboard (`/dashboard`)
- **LeetCode Integration**: Solved count breakdowns (Easy / Medium / Hard), contest rating progression, and submission snapshots.
- **Codeforces Integration**: Live contest rating, max rating, global rank, and upcoming contest feeds.
- **GitHub Contribution Calendar**: Visual contribution heatmaps, streak flame counters, and commit activity tracking.

### 🎯 2. Tailored Daily Operating Loop (`/tasks`)
- **Stats-Driven Task Generation**: Daily tasks dynamically adapt to your connected platform statistics (e.g. Codeforces target rating +100, LeetCode difficulty tiers).
- **Weak-Topic Insights**: `TopicRecommendationsCard` analyzes platform performance gaps and recommends focused learning areas (Binary Search, Dynamic Programming, System Design).
- **XP & Streak Engine**: Earn XP on first completion with duplicate-XP protection, streak milestone notifications (3, 7, 14, 30 days), and 14-day momentum summaries.

### 🧠 3. Spaced-Repetition Learning Memory (`/revision`)
- **Leitner / SuperMemo Algorithm**: Practice cards automatically schedule review intervals (`1d → 3d → 7d → 14d → 30d`) to optimize long-term memory retention.
- **Interactive Revision Cards**: Save key problem patterns, interview traps, and code solutions. Reviewing due cards awards **+10 XP**.

### 🏆 4. Weekly Quests & Gamification (`/quests`)
- **7-Day Quest Cycles**: Auto-evaluates weekly targets (*Task Crusher*, *XP Surge*, *Rhythm Master*, *Multi-Platform*) with bonus XP payouts.
- **Persisted Achievements (`/achievements`)**: Unlock 10 computed badges with persisted timestamp records (`UserAchievement`) and topbar notifications.

### 🌐 5. Open-Source Discovery Engine (`/open-source`)
- **Good First Issues**: Discover curated beginner-friendly open-source contributions matched to your tech stack.
- **Ecosystem Filters**: Filter issues by language (`TypeScript`, `Python`, `Go`, `Rust`) with repository star ratings ⭐ and direct issue links.

### 📅 6. Contest Hub & Calendar Export (`/contests`)
- **Upcoming Rounds**: Live feed of upcoming LeetCode and Codeforces contests.
- **One-Click Calendar Sync**: Export contests directly to **Google Calendar** or download standard **.ics (iCal)** calendar files.

---

## 🛡️ Enterprise Security & Architecture

Forge OS is engineered with modern application security standards:

- **Auth.js + JWT Bridge**: Next.js auth session issues a signed HS256 JWT (via `AUTH_SECRET`) verified on every API request by NestJS `JwtAuthGuard`.
- **Zero Exposed Secrets**: Sensitive tokens and keys are strictly scoped via environment variables and excluded from source control.
- **HTTP Header Hardening**: Configured with `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS), and `Referrer-Policy`.
- **Validation & Throttling**: API routes pass through `ZodValidationPipe` schema validation and `@nestjs/throttler` rate limiting.

---

## ⚡ Technology Stack

```text
┌─────────────────┬──────────────────────────────────────────────────────────┐
│ Layer           │ Technology                                               │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Frontend App    │ Next.js 15 (App Router), React 19, TypeScript, Tailwind  │
│ Backend API     │ NestJS 11, Prisma 6 ORM, Redis (cache-manager)           │
│ Database        │ PostgreSQL 16                                            │
│ State & Query   │ TanStack React Query v5, Zustand, Auth.js v5             │
│ CI / CD         │ GitHub Actions (Postgres 16 + Redis 7 integration tests) │
└─────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 📄 License & Terms

Copyright © 2026 **Forge OS Inc.** — Built for software engineers worldwide.
