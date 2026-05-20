# Deployment & Operations Guide

## 1. Prerequisites

- Node.js >= 18 (Tested on v26)
- PostgreSQL >= 14 (Tested on v16)
- Docker & Docker Compose (Optional for containerized operation)

## 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/stride_dev"
AI_PROVIDER="mock" # or "gemini" / "openai"
GEMINI_API_KEY=""
SESSION_SECRET="your-32-char-secure-secret-key"
```

## 3. Database Migration & Seed

```bash
# Push schema to database
npm run db:push

# Populate realistic personas, frameworks, goals, evidence, and reviews
npm run db:seed
```

## 4. Run Automated Test Suite

```bash
npm test
```

## 5. Production Build & Start

```bash
npm run build
npm start
```

## 6. Docker Deployment

```bash
docker-compose up -d --build
```

