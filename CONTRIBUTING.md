# Contributing to TekMarketing

Thank you for helping improve **TekMarketing Open Core** by [TEKHERO](https://tekhero.us).

---

## Before You Contribute

1. Read [AGENTS.md](AGENTS.md) — architecture and agent rules are non-negotiable.
2. Read [LICENSE](LICENSE) — contributions are accepted under the TEKHERO Open Core License.
3. **Commercial features** developed by TEKHERO may live in private repositories or gated modules — not all product capabilities are in this public repo.

---

## What We Welcome

- Bug fixes and test coverage
- Documentation improvements
- UI polish (dark theme, accessibility)
- Open-core agent reliability (Zod schemas, sanitization, error handling)
- Performance and security hardening for self-hosted deployments

---

## What Requires Discussion First

Open a GitHub Issue before starting work on:

- New platforms or content types (schema + prompt + UI changes)
- Changes to human-in-the-loop approval flows
- Publishing automation (high brand-risk surface)
- License or commercial tier changes
- Large refactors of `lib/agent/orchestrator.ts`

Email [info@tekhero.us](mailto:info@tekhero.us) for commercial partnership or sponsored feature requests.

---

## Development Setup

```powershell
git clone https://github.com/kheron/TekMarketing.git
cd TekMarketing
npm install --legacy-peer-deps
npx prisma migrate dev
npm run db:seed
npm run dev
```

```powershell
npm test
npm run lint
npm run build
```

---

## Pull Request Guidelines

1. **One concern per PR** — easier to review and revert.
2. **Agent logic stays in `lib/agent/`** — never in `app/api/` or components.
3. **Zod for all AI outputs** — no free-text JSON parsing.
4. **No bypass of human approval** for publish/schedule paths.
5. **ActivityLog** for agent-driven mutations.
6. Include manual test notes in the PR description.

---

## Code of Conduct

Be professional and constructive. TEKHERO maintains final merge authority on `main`.

---

## Contributor License Agreement (Implicit)

By submitting a PR, you agree your contribution may be distributed under the [TEKHERO Open Core License](LICENSE) and that TEKHERO may use it in commercial offerings without additional compensation (standard open-source contribution model).

---

Questions? Open an issue or email [info@tekhero.us](mailto:info@tekhero.us).