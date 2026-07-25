# Forge OS Security & Data Protection Policy

**CONFIDENTIAL & PROPRIETARY — FORGE OS INC.**

This repository contains proprietary software and intelligence systems. Security and secret confidentiality are strictly enforced.

## Security Practices

- **Zero Hardcoded Secrets**: All authentication keys, database credentials, and OAuth tokens are injected via environment variables (`.env`).
- **Data Protection**: Strict user isolation via Prisma transactions and JWT token verification.
- **Header Hardening**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`, `Referrer-Policy`, and `Permissions-Policy` headers enabled across all APIs and web surfaces.
