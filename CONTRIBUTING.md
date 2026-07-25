# Contributing to Forge

Thank you for your interest in contributing to **Forge — The Daily Operating System for Software Engineers**!

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
2. **Install Dependencies**:
   ```bash
   pnpm install
   ```
3. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in necessary OAuth variables.
4. **Start PostgreSQL & Redis**:
   ```bash
   docker compose up -d
   ```
5. **Initialize Database**:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```
6. **Run Dev Server**:
   ```bash
   pnpm dev
   ```

---

## 📐 Coding Conventions

- **Shared Schemas**: All request/response contracts must be defined in `packages/shared/src/schemas/` using Zod.
- **Strict Typing**: No `any` types. Run `pnpm typecheck` before submitting PRs.
- **Unit Tests**: Every new service or module in `apps/api` should include unit test coverage (`*.spec.ts`).
- **Commit Messages**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).

---

## 📋 Pull Request Workflow

1. Create a descriptive feature branch: `git checkout -b feat/your-feature-name`.
2. Ensure typecheck and unit tests pass locally:
   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```
3. Submit your PR against the `main` branch.
