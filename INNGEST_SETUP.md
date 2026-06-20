# Scheduled Runs with Inngest (Setup Guide)

The Inngest client and API route are fully set up in this project.

## Current Status

- Inngest SDK installed
- Client created at `lib/inngest/client.ts`
- API handler at `app/api/inngest/route.ts`
- One function defined (`dailyPlanningCycle`) that triggers `runPlanningCycle("scheduled")`

Due to some TypeScript friction between Inngest v4 and Next.js 16 during build, the scheduled function is currently commented out in the build.

## Recommended Way: Use Inngest Cloud (Easiest & Best)

1. Go to https://inngest.com and create a free account.

2. Create a new app and connect it to your deployed TekMarketing (or use the Dev Server locally).

3. In the Inngest dashboard, create a **Cron**:
   - Event name: `tekmarketing/scheduled.planning`
   - Schedule: `0 7 * * *` (every day at 07:00 UTC — change as needed)

4. That's it. Inngest Cloud will send the event on schedule, and your app will run the planning cycle.

## Local Development

While developing, you can manually trigger the scheduled event using the Inngest Dev Server:

```bash
npx inngest-cli@latest dev
```

Then in another terminal:

```bash
curl -X POST http://localhost:8288/e/tekmarketing \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tekmarketing/scheduled.planning",
    "data": {}
  }'
```

This will trigger the planning cycle locally.

## Future Improvement

Once the type issues are resolved, we can re-enable the native cron function directly in the code for zero-config scheduled runs.
