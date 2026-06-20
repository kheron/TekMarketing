import { NextRequest, NextResponse } from 'next/server'
import { normalizeStoredPackage } from '@/lib/agent/sanitize-episode'
import type { SocialPlatform } from '@/lib/agent/types'
import { prisma } from '@/lib/db/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const pkg = await prisma.contentPackage.findUnique({ where: { id }, include: { brandContext: { select: { companyName: true, visualStyle: true } } } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    const normalized = normalizeStoredPackage(
      {
        platforms: pkg.platforms as SocialPlatform[],
        strategyNote: pkg.strategyNote,
        agentReasoning: pkg.agentReasoning,
        content: pkg.content,
      },
      pkg.brandContext.visualStyle || 'clean, professional'
    )
    return NextResponse.json({ package: { id: pkg.id, businessId: pkg.brandContextId, businessName: pkg.brandContext.companyName, topic: pkg.topic, provider: pkg.provider, platforms: normalized.platforms, strategyNote: normalized.strategyNote, agentReasoning: normalized.agentReasoning, content: normalized.content, createdAt: pkg.createdAt.toISOString() } })
  } catch (error) {
    console.error('Failed to load package:', error)
    return NextResponse.json({ error: 'Failed to load package' }, { status: 500 })
  }
}