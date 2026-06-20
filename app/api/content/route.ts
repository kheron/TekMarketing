import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as any
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const formats = searchParams.getAll('format')

  try {
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (formats.length > 0) {
      where.format = { in: formats }
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
