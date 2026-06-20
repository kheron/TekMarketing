import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const [recentLogs, pendingCount, latestRun] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 12,
      }),
      prisma.contentItem.count({
        where: { status: 'PENDING_APPROVAL' },
      }),
      prisma.agentRun.findFirst({
        orderBy: { startedAt: 'desc' },
      }),
    ])

    // Check if brand exists
    const brand = await prisma.brandContext.findFirst()

    return NextResponse.json({
      recentLogs,
      pendingCount,
      latestRun: latestRun ? {
        ...latestRun,
        // Include summary for display
        summary: latestRun.summary,
      } : null,
      hasBrand: !!brand,
    })
  } catch (error) {
    console.error('Dashboard activity error:', error)
    // Return safe fallback
    return NextResponse.json({
      recentLogs: [],
      pendingCount: 0,
      latestRun: null,
      hasBrand: false,
    })
  }
}
