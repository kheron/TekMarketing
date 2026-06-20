# TekMarketing — Agent Development Guidelines

**Project:** Autonomous 24/7 AI Marketing Manager  
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind + Prisma + SQLite (dev) + xAI (Grok) + Zod

This document is the single source of truth for how to work on TekMarketing. All future development (human or AI) must follow these rules.

---

## Core Philosophy

TekMarketing is a **professional strategic marketing manager**, not a content spam tool.

- It thinks long-term and prioritizes high-ROI activities
- It maintains strict brand consistency and voice
- **It never publishes anything without explicit human approval**
- It is data-driven but creative
- It maintains a full audit trail and memory of every decision

When in doubt, bias toward:
- Clarity and professionalism over cleverness
- Safety and human control over full autonomy
- Modularity and clean boundaries

---

## Project Structure (Sacred)

All code lives inside this folder only. Never create files outside.

```
lib/agent/           → The brain. All reasoning, planning, and generation logic.
lib/ai/              → Thin, typed wrapper around xAI calls + structured output helpers.
lib/db/              → Prisma client singleton + any DB utilities.
app/                 → Next.js routes, API handlers, and UI pages.
components/          → Reusable UI (especially dashboard and approval flows).
prisma/              → Schema and migrations. Changes require a new migration.
```

**Never put agent logic in `app/api/` or components.**  
Agent logic belongs exclusively in `lib/agent/`.

---

## Agent Architecture Rules

### 1. The Agent Orchestrator is King
- `lib/agent/orchestrator.ts` (or `index.ts`) is the only place that coordinates full planning cycles.
- Every autonomous action must go through `AgentOrchestrator`.
- It must always load fresh `BrandContext` + recent `ActivityLog` + calendar state before deciding anything.

### 2. Structured Outputs Only (Zod is Non-Negotiable)
- Every single call to xAI must use Zod schemas for output.
- No free-text parsing. No "just ask it to return JSON".
- Define schemas in `lib/agent/types.ts` (or a dedicated `schemas/` folder).
- If the model returns something invalid, the orchestrator must handle it gracefully (retry with better prompt or fall back).

### 3. Prompts Live in `lib/agent/prompts/`
- Never put long system prompts inline in functions.
- Each prompt file exports clear, versioned templates.
- Always include the current brand voice + relevant context in the prompt.
- Document why each prompt exists.

### 4. Tools Are Pure(ish) Functions
- `lib/agent/tools/` contains discrete capabilities (generate post, critique, suggest timing, research, etc.).
- Tools should be testable in isolation.
- Tools must never directly mutate the database — return data, let the orchestrator persist.

### 5. Human-in-the-Loop Is Absolute
- No code path may ever set `status = "scheduled"` or `"published"` without going through an explicit approval action that creates an `Approval` record (or equivalent via `ActivityLog` + `approvedBy`).
- The `publishDueContent` logic (even when we add real publishing) may only move items to `READY_TO_PUBLISH`. A human must still trigger the final publish step in MVP.

---

## Database & State Rules

- BrandContext is effectively a singleton. There should only ever be one row (or the latest one).
- ContentItem.status is the source of truth for workflow.
- All important agent decisions must create an `ActivityLog` entry with rich `details` JSON.
- `AgentRun` records capture the full context snapshot at the time of planning — this is how the agent "remembers" and improves.

When adding new features:
- Add the necessary model changes + a migration.
- Update the corresponding Zod schemas in the agent layer.
- Add activity log types if the action is agent-driven.

---

## UI / Dashboard Rules

- The visual language is calm, professional, executive dark theme (zinc-950 / zinc-900 base).
- Use Lucide icons.
- Use Sonner for all toasts.
- Every approval action must show the **draft + full agent reasoning** side-by-side.
- "Regenerate with feedback" is a first-class action everywhere.

---

## Adding New Platforms or Content Types

1. Add the new value to the `Platform` or `ContentFormat` enum in `prisma/schema.prisma`.
2. Create a new prompt variant in `lib/agent/prompts/`.
3. Add a small adapter in `lib/agent/tools/` if special formatting is needed.
4. Update the dashboard UI to render the new type nicely.
5. Update AGENTS.md if the new channel has special considerations.

---

## Running the Agent Locally

```powershell
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — (Future) Inngest dev server for scheduled functions
npx inngest dev
```

For early development, use the manual "Run Planning Cycle" button in the dashboard. Do not rely on cron until Inngest is fully wired.

To run the agent from a script (useful for debugging):

```ts
import { runDailyPlanning } from "@/lib/agent/orchestrator";
// ...
```

---

## Environment & Secrets

- Never commit real keys.
- All required keys are documented in `.env.example`.
- The only required key for core MVP functionality is `XAI_API_KEY`.

---

## Testing & Quality

- The agent must be easy to test in isolation (mock the xAI client).
- When you change prompt behavior, manually run a planning cycle and review the output quality + reasoning before considering the change complete.
- Prisma changes always require `npx prisma migrate dev`.

---

## What "Done" Looks Like for a Feature

Before marking any agent-related work complete:

1. Brand voice is respected in generated output.
2. Full reasoning is stored and shown to the user.
3. The action is recorded in ActivityLog.
4. The UI gives clear feedback (toasts + updated lists).
5. No path exists that bypasses human approval for publishing actions.

---

## Questions?

When the correct behavior is ambiguous:
- Re-read this document.
- Default to "more human control" and "more explicit logging".
- If still unclear, document the assumption in the code and surface it in the UI.

This project succeeds when the marketing agent feels like a **trusted, strategic colleague** — not an unpredictable content generator.

---

## Open Core & Commercial Extensions (TEKHERO)

TekMarketing is an **open-core product** by [TEKHERO](https://tekhero.us). The public GitHub repository contains the core agent, studio, and HITL workflows. Commercial capabilities may ship separately or behind license configuration.

### Licensing boundary
- **Open Core (this repo):** Personal, educational, non-commercial use per [LICENSE](LICENSE).
- **Commercial:** Business production, client delivery, SaaS hosting, and white-label require a [TEKHERO license](COMMERCIAL.md). Contact: info@tekhero.us

### Configuration flags (`lib/config/tekhero.ts`)
| Variable | Purpose |
|----------|---------|
| `COMMERCIAL_MODE` | Marks a licensed business deployment |
| `TEKHERO_LICENSE_KEY` | License validation stub (enforcement expands later) |
| `TEKHERO_EDITION` | `open-core` (default) or `commercial` |
| `TELEMETRY_OPT_IN` | Privacy-respecting usage telemetry (`lib/telemetry/`) |
| `TEKHERO_OPEN_CORE_ACK` | Personal non-commercial production waiver |
| `TEKHERO_LICENSE_KEY` | `TKM-XXXX-XXXX-XXXX` — validated in `lib/config/license.ts` |

License enforcement: `lib/api/license-guard.ts` blocks agent/generation APIs in unlicensed production. Startup logs via `instrumentation.ts`.

### Where commercial code should live
- **Core agent behavior** (orchestrator, Zod schemas, prompts): stays in `lib/agent/` in open core unless explicitly gated.
- **Premium-only features** (SSO, multi-tenant, white-label theming, license enforcement): prefer `lib/commercial/` or TEKHERO private modules — never weaken open-core HITL guarantees.
- **UI branding:** `components/shared/TekheroFooter.tsx` — do not remove attribution in open core.

### Rules for commercial features
1. Human-in-the-loop and audit trail requirements apply to **all** editions.
2. Do not merge license-bypass or silent-publish paths into open core.
3. Document commercial-only behavior in [ROADMAP.md](ROADMAP.md) and [COMMERCIAL.md](COMMERCIAL.md).
4. Open-core contributions must not expose TEKHERO customer secrets or proprietary prompts.

### Sales & deployment docs
- [COMMERCIAL.md](COMMERCIAL.md) — tiers and purchasing
- [DEPLOYMENT.md](DEPLOYMENT.md) — production self-host guide
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution boundaries
