# Deploy TekMarketing to Vercel (`app.tekhero.us`)

One-time setup checklist. DNS is in Cloudflare; the marketing site stays on Cloudflare Pages.

---

## 1. Create Neon database (free)

1. Go to [neon.tech](https://neon.tech) → New project → name `tekmarketing`
2. Copy the **pooled** connection string (`?sslmode=require`)
3. Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/tekmarketing?sslmode=require`

---

## 2. Import project on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `kheron/TekMarketing`
2. Framework: **Next.js** (auto-detected)
3. Build settings are in `vercel.json` — do not override unless debugging

---

## 3. Environment variables (Vercel → Settings → Environment Variables)

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | Neon pooled connection string | Production, Preview |
| `SETTINGS_ENCRYPTION_KEY` | 64-char hex (generate once, keep stable) | Production, Preview |
| `TEKHERO_OPEN_CORE_ACK` | `true` | Production (demo) |
| `NEXT_PUBLIC_TEKHERO_PRODUCT_URL` | `https://tekhero.us/tekmarketing` | Production, Preview |
| `XAI_API_KEY` | Your xAI key (for live agent runs) | Production |
| `TEKHERO_LICENSE_KEY` | `TKM-...` when commercial | Optional |

Generate encryption key:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Deploy

Push to `main` (Git integration) or:

```powershell
cd C:\Users\korey\Documents\APPS\TekMarketing
npx vercel link
npx vercel env pull .env.vercel.local
npx vercel --prod
```

---

## 5. Custom domain `app.tekhero.us`

### Vercel

1. Project → **Settings** → **Domains** → Add `app.tekhero.us`
2. Vercel shows a CNAME target (e.g. `cname.vercel-dns.com`)

### Cloudflare DNS

1. Cloudflare dashboard → `tekhero.us` → **DNS**
2. Add record:
   - **Type:** CNAME
   - **Name:** `app`
   - **Target:** `cname.vercel-dns.com` (use value from Vercel)
   - **Proxy:** DNS only (grey cloud) recommended for Vercel SSL

Wait 5–15 minutes for SSL provisioning.

---

## 6. Seed demo data (once)

After first successful deploy:

```powershell
# Pull production DATABASE_URL locally (or paste from Neon)
$env:DATABASE_URL="postgresql://..."
npx prisma db push
npm run db:seed
```

Or use Neon SQL editor — seed is optional; app works without it.

---

## 7. Verify

- https://app.tekhero.us — dashboard loads
- https://app.tekhero.us/api/config — `licenseTier: "open-core-ack"`
- https://tekhero.us/tekmarketing — "Open Demo App" links work
- Run planning cycle (requires `XAI_API_KEY`)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `DATABASE_URL` is set in Vercel env |
| 402 on agent run | Set `TEKHERO_OPEN_CORE_ACK=true` or `TEKHERO_LICENSE_KEY` |
| Domain SSL pending | Grey-cloud CNAME; wait for Vercel cert |
| Local dev after postgres switch | Use Neon dev branch URL in `.env.local` |