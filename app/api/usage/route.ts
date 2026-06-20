import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const [logs, summary] = await Promise.all([
      prisma.apiUsageLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.apiUsageLog.aggregate({ _sum: { totalTokens: true, estimatedCostUsd: true }, _count: true }),
    ])
    return NextResponse.json({ totalCalls: summary._count, totalTokens: summary._sum.totalTokens || 0, estimatedCostUsd: summary._sum.estimatedCostUsd || 0, recentLogs: logs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load usage data' }, { status: 500 })
  }
}
