# Stride

Stride is an employee-growth and career-progression application. It supports goals and milestones, work evidence and verification, coaching, review cycles, development plans, role frameworks, career conversations, audit records, privacy requests, and review-oriented AI summaries.

## Architecture

This is a Next.js 14 App Router modular monolith. Route handlers in `src/app/api/v1` expose the domain APIs; `src/modules` contains feature logic; `src/lib` contains database, authentication, validation, and observability code. Prisma maps the PostgreSQL schema in `prisma/`; `prisma/seed.ts` provides development data. Tests are split between unit and integration suites.

## Setup

Requires Node.js 18+ and PostgreSQL 16+.

```bash
cd 11_Stride
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:push
npm run db:seed
npm run dev
```

Use `AI_PROVIDER=mock` for a self-contained local setup. Database URLs and `SESSION_SECRET` must be replaced with deployment-specific values.

```bash
npm test
npm run lint
npm run build
npm start
```

For a containerized app/database combination, `docker compose up --build` is also available. It uses the Compose-provided database configuration.
