# 🔒 Forge OS — Proprietary Product Codebase

> **CONFIDENTIAL & PROPRIETARY PROPERTY OF FORGE OS INC.**
> All rights reserved. Unauthorized copying, distribution, or reproduction of this codebase or any portion thereof is strictly prohibited.

---

## ⚡ Product Overview

**Forge OS** is the daily operating system for software engineers, unifying competitive programming metrics, coding streak engines, spaced-repetition memory cards, weekly quests, and contest feeds into one high-performance platform.

---

## 🚀 Architecture & Monorepo Layout

```text
forge/
├── apps/
│   ├── web/        # Next.js 15 (App Router) — Dashboard, Auth.js, React Query
│   └── api/        # NestJS 11 — Platform integrations, Quests, Revision, Notifications
├── packages/
│   ├── ui/         # Shared Tailwind design system & visual primitives
│   ├── database/   # Prisma schema, migrations, generated client, seed
│   ├── shared/     # Shared Zod schemas, DTO types, API response envelopes
│   └── config/     # Shared tsconfig, ESLint, Tailwind presets
├── docs/           # Product Architecture, Context, Development Guide, Roadmap
└── docker-compose.yml   # PostgreSQL 16 + Redis 7
```

---

## 🛠️ Local Setup & Backup Restore

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env

# 3. Start local Postgres 16 & Redis 7
docker compose up -d

# 4. Initialize Database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Start Development Server (Web :3100, API :3101)
pnpm dev
```

---

## 🧪 Verification & Build Commands

```bash
# Monorepo typecheck
pnpm typecheck

# Unit tests
pnpm test

# Production build
pnpm build
```

---

## 📄 License

**Proprietary & Confidential — All Rights Reserved.**
