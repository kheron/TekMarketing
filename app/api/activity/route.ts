import { NextRequest, NextResponse } from 'next/server'
import type { ActivityType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const type = searchParams.get('type') || undefined

  try {
    const where: Prisma.ActivityLogWhereInput = type ? { type: type as ActivityType } : {}

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          contentItem: {
            select: {
              id: true,
              platform: true,
              format: true,
              title: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    return NextResponse.json({ error: 'Failed to load activity history' }, { status: 500 })
  }
}
