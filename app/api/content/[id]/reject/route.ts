import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { feedback } = body

    const updated = await prisma.contentItem.update({
      where: { id },
      data: {
        status: 'REJECTED',
        humanFeedback: feedback || null,
      },
    })

    await prisma.activityLog.create({
      data: {
        type: 'CONTENT_REJECTED',
        summary: `Rejected ${updated.platform} content`,
        details: { 
          contentItemId: id, 
          platform: updated.platform,
          feedback: feedback || null 
        },
        contentItemId: id,
      },
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (error) {
    console.error('Reject failed:', error)
    return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 })
  }
}
