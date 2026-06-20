import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { scheduledFor } = body // optional

    const updated = await prisma.contentItem.update({
      where: { id },
      data: {
        status: scheduledFor ? 'SCHEDULED' : 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'user',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 1000 * 60 * 30), // default: 30 min from now if not specified
      },
    })

    // Log the action
    await prisma.activityLog.create({
      data: {
        type: 'CONTENT_APPROVED',
        summary: `Approved ${updated.platform} ${updated.format.toLowerCase()} (scheduled for ${updated.scheduledFor?.toISOString()})`,
        details: { contentItemId: id, platform: updated.platform, scheduledFor: updated.scheduledFor },
        contentItemId: id,
      },
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (error) {
    console.error('Approve failed:', error)
    return NextResponse.json({ error: 'Failed to approve item' }, { status: 500 })
  }
}
