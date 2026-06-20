import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const items = await prisma.contentItem.findMany({
      where: { status: 'PENDING_APPROVAL' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch pending content:', error)
    return NextResponse.json({ error: 'Failed to load pending items' }, { status: 500 })
  }
}
