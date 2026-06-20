# TekMarketing

**An autonomous AI marketing manager with human-in-the-loop approval — now with multi-platform content generation.**

Plans marketing content, generates multi-platform packages (YouTube, TikTok, Instagram, X, LinkedIn), and never publishes without your explicit approval.

---

## Features

### Autonomous Agent (Planning Cycle)
- Loads brand context + 14-day activity memory
- Proposes strategic content for X and LinkedIn
- Structured JSON outputs with Zod validation
- Full audit trail via `ActivityLog` and `AgentRun`

### Content Studio (from TekSocial)
- **Multi-platform generation**: YouTube Shorts/Long, TikTok, Instagram, X, LinkedIn, Facebook
- **Multi-provider AI**: OpenAI, Anthropic, xAI (Grok), Google Gemini
- **Image generation**: DALL·E 3, Grok Imagine, Gemini (via API)
- Per-platform regeneration with human feedback
- Content packages persisted in SQLite/Postgres

### Human-in-the-Loop
- Approvals UI with draft + agent reasoning side-by-side
- Approve, reject, or regenerate with feedback
- Calendar view for scheduled content

---

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma** + SQLite (dev) / Postgres (production)
- **Multi-provider AI** via unified `callAI()` abstraction
- **Zod** structured outputs throughout
- **Inngest** (planned) for scheduled agent workflows

---

## Quick Start

```powershell
cd C:\Users\korey\Documents\APPS\TekMarketing
npm install --legacy-peer-deps
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000

### Tests

```powershell
npm test
```

### API Keys

Go to **Settings** and add keys for one or more providers:
- `XAI_API_KEY` (Grok) — or set in `.env.local`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`

Keys are encrypted at rest in the local database.

---

## Key Workflows

| Workflow | Path |
|----------|------|
| Set up brand | `/businesses/new` |
| Run planning cycle | Dashboard → **Run Planning Cycle** |
| Generate multi-platform content | `/content-studio/generate` |
| Review & approve | `/content-studio/approvals` |
| View calendar | `/content-studio/calendar` |
| API usage | `/usage` |

---

## Project Structure

```
lib/agent/           → Orchestrator, content generation, prompts
lib/ai/              → Multi-provider callAI, image gen, usage tracking
lib/constants/       → AI providers, platforms, image config
lib/settings/        → Encrypted API key storage
prisma/              → Schema + migrations
app/api/             → REST API routes
components/          → UI (approvals, studio, business forms)
```

---

## Architecture

```
Planning Cycle:
  Dashboard → POST /api/agent/run → orchestrator → ContentItems (PENDING_APPROVAL)

Content Studio:
  Generate → POST /api/generate → generateEpisode() → ContentPackage (DB)

Approvals:
  /content-studio/approvals → approve/reject/regenerate APIs
```

---

## License

MIT — open source, portfolio-ready.

Built as a strategic AI marketing partner, not a generic content spam tool.
