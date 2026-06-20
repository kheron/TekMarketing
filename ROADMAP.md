# TekMarketing Roadmap

**Open Core by [TEKHERO](https://tekhero.us)** — public roadmap for transparency. Commercial tiers may receive early access to items marked **Commercial**.

---

## Shipped (Open Core)

- [x] Autonomous planning agent with Zod-validated outputs
- [x] Human-in-the-loop approvals (draft + reasoning side-by-side)
- [x] Multi-platform Content Studio (YouTube, TikTok, Instagram, X, LinkedIn, Facebook)
- [x] Multi-provider AI (`callAI()` — OpenAI, Anthropic, xAI, Google)
- [x] Image generation (DALL·E 3, Grok Imagine, Gemini)
- [x] ActivityLog + AgentRun audit trail
- [x] Encrypted API key storage
- [x] API usage & cost tracking
- [x] Demo seed script (`npm run db:seed`)
- [x] Docker self-hosted demo
- [x] CI pipeline (lint, test, build)
- [x] Open Core licensing + commercial docs

---

## In Progress

- [ ] Public Vercel demo deployment
- [ ] README screenshots / GIF walkthrough
- [ ] Expanded Vitest coverage (orchestrator, generate-episode)

---

## Open Core (Planned — Free / GitHub)

| Feature | Target | Notes |
|---------|--------|-------|
| Retry + provider fallback in `callAI()` | Q3 2026 | Resilience without vendor lock-in |
| Inngest native cron re-enabled | Q3 2026 | Scheduled planning cycles |
| Rate limiting on agent API routes | Q3 2026 | Basic abuse protection |
| Pagination on activity/content APIs | Q3 2026 | Scale-friendly queries |
| Langfuse integration hook | Q4 2026 | Opt-in observability |

---

## Commercial (TEKHERO Licensed)

| Feature | Tier | Notes |
|---------|------|-------|
| `TEKHERO_LICENSE_KEY` validation | Business+ | Deployment entitlement |
| TEKHERO Hosted SaaS | Hosted | Managed Postgres, backups, updates |
| White-label UI + custom domain | Enterprise | Remove/replace TEKHERO branding |
| SSO (SAML/OIDC) | Enterprise | Team access control |
| Multi-tenant / org workspaces | Enterprise | Agencies managing multiple clients |
| Agent tool-calling (web research) | Business+ | Trending topics, competitor signals |
| Content evaluation scoring | Business+ | Brand alignment + engagement potential |
| Priority support & SLA | Business+ | Email / dedicated channel |
| Telemetry dashboard | Hosted+ | Usage, cost, agent run analytics |
| Custom agent workflows | Enterprise | Bespoke prompts, tools, integrations |
| Publishing connectors (X, LinkedIn APIs) | Business+ | Beyond READY_TO_PUBLISH stub |

---

## How Features Get Prioritized

1. **Open Core safety & HITL** — never compromised for velocity
2. **Commercial customer commitments** — SLA and contracted features
3. **Community issues** — bugs and clear wins on GitHub
4. **Portfolio / engineering quality** — test coverage, observability

---

## Request a Feature

- **Open Core:** [GitHub Issues](https://github.com/kheron/TekMarketing/issues)
- **Commercial:** [info@tekhero.us](mailto:info@tekhero.us)

See [COMMERCIAL.md](COMMERCIAL.md) for licensing.