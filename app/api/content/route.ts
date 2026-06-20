import { NextRequest, NextResponse } from 'next/server'
import type { ContentFormat, ContentStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as ContentStatus | null
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const formats = searchParams.getAll('format')

  try {
    const where: Prisma.ContentItemWhereInput = {}
    if (status) {
      where.status = status
    }
    if (formats.length > 0) {
      where.format = { in: formats as ContentFormat[] }
    }

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch content items:', error)
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 })
  }
}
