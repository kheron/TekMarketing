# TekMarketing

> **An autonomous AI marketing manager that plans strategically, generates multi-platform content, and never publishes without human approval.**

[![CI](https://github.com/kheron/TekMarketing/actions/workflows/ci.yml/badge.svg)](https://github.com/kheron/TekMarketing/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live demo:** _Coming soon — [Vercel deploy guide](#deploy-to-vercel-neon--supabase) below_

---

## Why This Project Matters (AI Engineering Portfolio)

Most "AI marketing tools" are thin wrappers around `chat.completions.create()` that dump posts into a queue. **TekMarketing is different** — it demonstrates how to build a **production-grade agent** with:

| Principle | How TekMarketing implements it |
|-----------|-------------------------------|
| **Human-in-the-loop (HITL)** | No code path sets `published` or `scheduled` without an explicit approval record |
| **Structured outputs** | Every LLM call validated with **Zod** — no free-text JSON parsing |
| **Audit trail & memory** | `ActivityLog` + `AgentRun` capture every decision with context snapshots |
| **Multi-provider resilience** | Unified `callAI()` abstraction across OpenAI, Anthropic, xAI, Google |
| **Clean architecture** | Agent logic isolated in `lib/agent/`; orchestrator is the single coordination point |

This is the kind of system I'd ship for a real marketing team: **strategic, observable, and safe by default** — not a content spam cannon.

---

## Standout Features

### Autonomous Planning Agent
- Loads **brand context** + **14-day activity memory** before every cycle
- Proposes strategic X/LinkedIn content with confidence scores and reasoning
- Sanitizes and validates model output; retries on malformed JSON
- Full provenance: every proposal links back to an `AgentRun`

### Content Studio
- **Multi-platform generation**: YouTube Shorts/Long, TikTok, Instagram, X, LinkedIn, Facebook
- **Multi-provider AI** with per-call usage tracking and cost estimates
- **Image generation**: DALL·E 3, Grok Imagine, Gemini
- Per-platform regeneration with human feedback

### Human-in-the-Loop Workflow
- Approvals UI: **draft + agent reasoning side-by-side**
- Approve, reject, or regenerate with feedback
- Calendar view for scheduled content
- Encrypted API key storage in Settings

---

## Screenshots

> Add captures to `public/screenshots/` to replace placeholders. Recommended views:

| View | Path | Description |
|------|------|-------------|
| Dashboard | `public/screenshots/dashboard.png` | Planning cycle, activity feed, quick actions |
| Content Studio | `public/screenshots/content-studio.png` | Multi-platform generation |
| Approvals | `public/screenshots/approvals.png` | Draft + reasoning side-by-side |
| Calendar | `public/screenshots/calendar.png` | Scheduled content timeline |
| Settings | `public/screenshots/settings.png` | Multi-provider API keys |

_Run `npm run db:seed && npm run dev`, capture screenshots, and save to `public/screenshots/`._

---

## Architecture

```mermaid
flowchart TB
    subgraph UI["Dashboard & Studio"]
        D[Dashboard]
        CS[Content Studio]
        AP[Approvals Panel]
        CAL[Calendar]
    end

    subgraph API["Next.js API Routes"]
        AR["/api/agent/run"]
        GEN["/api/generate"]
        APR["/api/content/approve"]
    end

    subgraph Agent["lib/agent/ (Brain)"]
        ORC[Orchestrator]
        CTX[Context Loader]
        PRM[Prompts]
        TYP[Zod Schemas]
        GEN_EP[generateEpisode]
    end

    subgraph AI["lib/ai/"]
        CALL[callAI]
        PROV[Multi-Provider Layer]
        USG[Usage Tracking]
    end

    subgraph DB["Prisma + SQLite/Postgres"]
        BC[BrandContext]
        CI[ContentItem]
        AL[ActivityLog]
        RUN[AgentRun]
    end

    D --> AR
    CS --> GEN
    AP --> APR

    AR --> ORC
    GEN --> GEN_EP
    ORC --> CTX
    ORC --> PRM
    ORC --> CALL
    GEN_EP --> CALL
    CALL --> PROV
    CALL --> USG

    ORC --> CI
    ORC --> AL
    ORC --> RUN
    GEN_EP --> BC
    APR --> CI
    APR --> AL

    CTX --> BC
    CTX --> AL
    CTX --> CI
```

### Planning cycle flow

```
User clicks "Run Planning Cycle"
  → POST /api/agent/run
  → orchestrator.runPlanningCycle()
      1. Load BrandContext + 14-day ActivityLog + recent ContentItems
      2. Build context summary
      3. callXAI() with planning prompt
      4. Parse + sanitize + Zod validate
      5. Persist ContentItems (PENDING_APPROVAL)
      6. Write ActivityLog + complete AgentRun
  → Dashboard refreshes with new proposals
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Lucide icons, Sonner toasts |
| Database | Prisma — SQLite (local) / PostgreSQL (production) |
| AI | OpenAI, Anthropic, xAI (Grok), Google Gemini |
| Validation | Zod structured outputs throughout agent layer |
| Scheduling | Inngest (client wired; cron via Inngest Cloud) |
| Testing | Vitest |

---

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- At least one AI provider API key (xAI recommended for planning agent)

### Setup

```powershell
git clone https://github.com/kheron/TekMarketing.git
cd TekMarketing
npm install --legacy-peer-deps
npx prisma migrate dev
npm run db:seed    # optional — loads demo brand + sample proposals (no API key needed to explore UI)
npm run dev
```

Open **http://localhost:3000**

### Explore without API keys

```powershell
npm run db:seed
npm run dev
```

The seed script creates a fictional brand (**TekFlow Analytics**), sample activity logs, and pending approvals so you can explore the dashboard, approvals flow, and calendar **without calling any LLM**.

To run a live planning cycle or generate content, add at least one key in **Settings** or `.env.local`.

### Environment variables

Copy `.env.example` to `.env.local`:

```env
DATABASE_URL="file:./dev.db"
SETTINGS_ENCRYPTION_KEY=<64-char-hex>   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
XAI_API_KEY=your_key_here               # required for planning agent
```

Keys can also be stored encrypted via the Settings UI.

### Tests & CI

```powershell
npm test        # Vitest — agent sanitization, parsing, formatting
npm run lint
npm run build
```

GitHub Actions runs lint → test → build on every push to `main`.

---

## Key Workflows

| Workflow | Path |
|----------|------|
| Set up brand | `/businesses/new` |
| Run planning cycle | Dashboard → **Run Planning Cycle** |
| Generate multi-platform content | `/content-studio/generate` |
| Review & approve | `/content-studio/approvals` |
| View calendar | `/content-studio/calendar` |
| API usage & costs | `/usage` |
| Provider settings | `/settings` |

---

## Architecture Decisions

### Why human-in-the-loop is absolute
Autonomous agents that publish directly create brand risk. TekMarketing treats the agent as a **strategic colleague** that proposes — humans decide. Every approval creates an audit record; `publishDueContent` (future) may only reach `READY_TO_PUBLISH`.

### Why Zod everywhere
LLMs return malformed JSON often. Zod schemas in `lib/agent/types.ts` enforce structure at the boundary. The orchestrator sanitizes common model mistakes (wrong enum values, missing fields) before validation, with graceful fallback proposals.

### Why multi-provider
Different providers excel at different tasks (Grok for planning, OpenAI for images, etc.). `callAI()` centralizes key resolution, provider routing, and usage logging — swap models without touching agent logic.

### Why orchestrator is king
`lib/agent/orchestrator.ts` is the **only** place that coordinates full planning cycles. Tools in `lib/agent/tools/` (future) return data; the orchestrator persists. This keeps agent behavior testable and auditable.

---

## Project Structure

```
lib/agent/           → Orchestrator, generation, prompts, Zod types
lib/ai/              → callAI(), providers, image gen, usage tracking
lib/constants/       → Platforms, providers, image config
lib/settings/        → Encrypted API key storage
lib/inngest/         → Scheduled planning (Inngest client + functions)
prisma/              → Schema, migrations, seed script
app/api/             → REST API routes (thin — no agent logic)
components/          → Dashboard, approvals, studio UI
```

See [AGENTS.md](AGENTS.md) for contributor rules.

---

## Deploy to Vercel (Neon / Supabase)

### 1. Database (PostgreSQL)

1. Create a free Postgres database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Update `prisma/schema.prisma` datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations against Postgres:

```powershell
$env:DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
npx prisma migrate deploy
```

### 2. Vercel project

1. Import the GitHub repo at [vercel.com](https://vercel.com).
2. Set environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Postgres connection string |
| `SETTINGS_ENCRYPTION_KEY` | 64-char hex (generate once, keep stable) |
| `XAI_API_KEY` | At least one provider key |
| `INNGEST_EVENT_KEY` | _(optional)_ for scheduled runs |
| `INNGEST_SIGNING_KEY` | _(optional)_ for scheduled runs |

3. Build command: `npx prisma generate && npm run build`
4. Deploy. Run `npx prisma migrate deploy` via Vercel build or a one-time script.

### 3. Scheduled planning (Inngest)

See [INNGEST_SETUP.md](INNGEST_SETUP.md) — create a cron event `tekmarketing/scheduled.planning` at `0 7 * * *` UTC.

---

## Docker (Local Demo)

Run a self-contained demo with SQLite persistence:

```powershell
docker compose up --build
```

Open **http://localhost:3000**. Migrations and seed data run automatically on first start.

See [docker-compose.yml](docker-compose.yml) for configuration.

---

## Learnings & Challenges

| Challenge | Approach |
|-----------|----------|
| LLMs return invalid enums | Sanitize before Zod; map agent formats to Prisma `ContentFormat` |
| Prisma + Next.js hot reload | Lazy Prisma import in orchestrator avoids client crashes during dev |
| Inngest v4 + Next.js 16 types | Functions exported as typed array; cron via Inngest Cloud until native cron re-enabled |
| Multi-provider cost visibility | `ApiUsageLog` tracks tokens + estimated USD per call |
| Portfolio demo without keys | `prisma/seed.mjs` populates realistic UI state for reviewers |

---

## Roadmap (Portfolio Next Steps)

- [ ] Expand Vitest coverage (orchestrator, generate-episode, regenerate)
- [ ] Retry + fallback providers in `callAI()`
- [ ] Re-enable Inngest native cron functions
- [ ] Tool-calling for web research (trending topics)
- [ ] Langfuse/LangSmith integration point for agent observability
- [ ] Public Vercel demo deployment

---

## License

MIT — open source, portfolio-ready.

Built as a **trusted strategic marketing colleague**, not a generic content spam tool.