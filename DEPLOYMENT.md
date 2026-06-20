# TekMarketing — Production & Self-Hosted Deployment

**By [TEKHERO](https://tekhero.us)** — for client and business deployments, a [commercial license](COMMERCIAL.md) is required.

---

## Deployment Options

| Model | Best for | License |
|-------|----------|---------|
| Local / Docker demo | Evaluation, development | Open Core |
| Self-hosted (VPS / cloud) | Business production | **Commercial** |
| TEKHERO Hosted SaaS | Hands-off operations | **Commercial** (included) |
| White-label | Agencies, resellers | **Enterprise** |

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (production) — Neon, Supabase, RDS, or self-managed
- At least one AI provider API key
- `SETTINGS_ENCRYPTION_KEY` (64-char hex, stable across deploys)
- Commercial: `TEKHERO_LICENSE_KEY` + `COMMERCIAL_MODE=true`

---

## Production Checklist

- [ ] Commercial license confirmed ([info@tekhero.us](mailto:info@tekhero.us))
- [ ] Postgres `DATABASE_URL` with SSL
- [ ] `prisma/schema.prisma` provider set to `postgresql`
- [ ] `npx prisma migrate deploy` in CI/CD
- [ ] `SETTINGS_ENCRYPTION_KEY` stored in secrets manager (never rotate without migration plan)
- [ ] AI keys in env or encrypted via Settings UI
- [ ] HTTPS termination (Vercel, nginx, or load balancer)
- [ ] Inngest configured for scheduled planning (optional)
- [ ] Backups enabled on Postgres
- [ ] `TELEMETRY_OPT_IN` set per org policy (default: off)
- [ ] `TEKHERO_LICENSE_KEY` (commercial) **or** `TEKHERO_OPEN_CORE_ACK=true` (personal demo only)
- [ ] `NEXT_PUBLIC_TEKHERO_PRODUCT_URL=https://tekhero.us/tekmarketing` when serving landing at tekhero.us

---

## Vercel + Neon (Recommended SaaS-style Self-Host)

### 1. Database

```powershell
# Create Neon project → copy connection string
# Update prisma/schema.prisma:
#   provider = "postgresql"
```

```powershell
$env:DATABASE_URL="postgresql://user:pass@host/tekmarketing?sslmode=require"
npx prisma migrate deploy
```

### 2. Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `SETTINGS_ENCRYPTION_KEY` | Yes | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `XAI_API_KEY` | Yes* | Or another provider via Settings |
| `COMMERCIAL_MODE` | Commercial | `true` |
| `TEKHERO_LICENSE_KEY` | Commercial | From TEKHERO |
| `TEKHERO_EDITION` | Commercial | `commercial` |
| `TELEMETRY_OPT_IN` | Optional | `true` to enable usage telemetry stub |
| `INNGEST_EVENT_KEY` | Optional | Scheduled planning |
| `INNGEST_SIGNING_KEY` | Optional | Scheduled planning |

### 3. Build settings

- **Build command:** `npx prisma generate && npm run build`
- **Install command:** `npm ci --legacy-peer-deps`
- **Output:** Next.js (standalone enabled in `next.config.ts`)

---

## Docker (Self-Hosted)

```powershell
docker compose up --build
```

For production:

1. Set env vars in `docker-compose.yml` or an `.env` file
2. Use a Postgres `DATABASE_URL` instead of SQLite volume
3. Mount secrets for `SETTINGS_ENCRYPTION_KEY` and `TEKHERO_LICENSE_KEY`
4. Put a reverse proxy (Caddy, nginx) in front for TLS

See [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile).

---

## Post-Deploy Verification

```powershell
curl https://your-domain/api/config
# Expect: { "edition": "commercial", "commercialMode": true, ... }

npm run db:seed   # optional demo data (skip in production)
```

Manual checks:

1. Create business profile at `/businesses/new`
2. Run planning cycle from dashboard
3. Approve content at `/content-studio/approvals`
4. Confirm `ActivityLog` entries in `/content-studio/activity`
5. Verify Settings → provider keys work

---

## Scaling Notes

- Agent runs are synchronous today — consider Inngest or a job queue for high volume
- Add connection pooling (PgBouncer / Neon pooler) for serverless Postgres
- Paginate large activity feeds before 10k+ log rows

---

## Support

- **Open Core community:** [GitHub Issues](https://github.com/kheron/TekMarketing/issues)
- **Commercial deployments:** [info@tekhero.us](mailto:info@tekhero.us)