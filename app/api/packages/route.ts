import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandContextId = searchParams.get('brandContextId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const packages = await prisma.contentPackage.findMany({ where: brandContextId ? { brandContextId } : undefined, orderBy: { createdAt: 'desc' }, take: limit, include: { brandContext: { select: { companyName: true } } } })
    return NextResponse.json({ packages: packages.map((p) => ({ id: p.id, businessId: p.brandContextId, businessName: p.brandContext.companyName, topic: p.topic, provider: p.provider, platforms: p.platforms, strategyNote: p.strategyNote, agentReasoning: p.agentReasoning, content: p.content, createdAt: p.createdAt.toISOString() })) })
  } catch (error) {
    console.error('Failed to list packages:', error)
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 })
  }
}