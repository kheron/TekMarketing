import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { body: newBody, title, agentReasoning } = body

    const updated = await prisma.contentItem.update({
      where: { id },
      data: {
        ...(newBody && { body: newBody }),
        ...(title && { title }),
        ...(agentReasoning && { agentReasoning }),
      },
    })

    await prisma.activityLog.create({
      data: {
        type: 'CONTENT_REGENERATED', // reuse for now, or we can add EDITED later
        summary: `Edited ${updated.platform} content`,
        details: { contentItemId: id, platform: updated.platform },
        contentItemId: id,
      },
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (error) {
    console.error('Update failed:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
