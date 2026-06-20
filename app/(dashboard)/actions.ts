'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function seedDemoActivity() {
  // Create a fake but realistic agent run + activity log entries
  const run = await prisma.agentRun.create({
    data: {
      trigger: 'manual',
      status: 'completed',
      startedAt: new Date(Date.now() - 1000 * 60 * 12), // 12 min ago
      completedAt: new Date(Date.now() - 1000 * 60 * 11),
      summary: 'Daily planning cycle completed. Proposed 6 new pieces of content across X and LinkedIn.',
      goals: ['Increase thought leadership on AI agents', 'Drive demo signups this week'],
      proposals: { total: 6, platforms: ['X', 'LINKEDIN'] },
    },
  })

  const activities = [
    {
      type: 'AGENT_PLANNING_STARTED' as const,
      summary: 'Started daily strategy run',
      details: { trigger: 'scheduled' },
    },
    {
      type: 'CONTENT_GENERATED' as const,
      summary: 'Generated LinkedIn post about "Why most AI agents fail in production"',
      details: {
        platform: 'LINKEDIN',
        format: 'POST',
        reasoning: 'Strong performance on similar contrarian takes last month. Good hook for technical founders.',
        confidence: 0.87,
      },
    },
    {
      type: 'CONTENT_GENERATED' as const,
      summary: 'Created 4-tweet thread for X about autonomous marketing loops',
      details: {
        platform: 'X',
        format: 'THREAD',
        reasoning: 'Current trending topic in AI tooling. Low competition this week.',
      },
    },
    {
      type: 'CONTENT_GENERATED' as const,
      summary: 'Proposed cold email sequence for "Polsia-style agent" comparison piece',
      details: {
        platform: 'EMAIL',
        reasoning: 'High open rates on comparison content in the past. Targets ICP perfectly.',
      },
    },
    {
      type: 'AGENT_PLANNING_COMPLETED' as const,
      summary: 'Planning cycle finished. 6 drafts ready for review.',
      details: { totalProposals: 6, needsApproval: 4 },
    },
  ]

  for (const act of activities) {
    await prisma.activityLog.create({
      data: {
        type: act.type,
        summary: act.summary,
        details: act.details,
        agentRunId: run.id,
        timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 10),
      },
    })
  }

  revalidatePath('/')
  // No return value needed for simple form action in server component
}

export async function getDashboardData() {
  const [recentLogs, pendingCount, latestRun, brand] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 12,
      include: {
        agentRun: true,
      },
    }),
    prisma.contentItem.count({
      where: { status: 'PENDING_APPROVAL' },
    }),
    prisma.agentRun.findFirst({
      orderBy: { startedAt: 'desc' },
    }),
    prisma.brandContext.findFirst(),
  ])

  return {
    recentLogs,
    pendingCount,
    latestRun,
    hasBrand: !!brand,
  }
}
