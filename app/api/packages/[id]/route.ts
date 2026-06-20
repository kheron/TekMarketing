import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const pkg = await prisma.contentPackage.findUnique({ where: { id }, include: { brandContext: { select: { companyName: true } } } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    return NextResponse.json({ package: { id: pkg.id, businessId: pkg.brandContextId, businessName: pkg.brandContext.companyName, topic: pkg.topic, provider: pkg.provider, platforms: pkg.platforms, strategyNote: pkg.strategyNote, agentReasoning: pkg.agentReasoning, content: pkg.content, createdAt: pkg.createdAt.toISOString() } })
  } catch (error) {
    console.error('Failed to load package:', error)
    return NextResponse.json({ error: 'Failed to load package' }, { status: 500 })
  }
}