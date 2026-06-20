import { NextRequest, NextResponse } from 'next/server'
import { licenseGuardResponse } from '@/lib/api/license-guard'
import { regenerateContentWithFeedback } from '@/lib/agent/orchestrator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = licenseGuardResponse()
  if (blocked) return blocked

  try {
    const { id } = await params
    const body = await request.json()
    const { feedback } = body

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
    }

    const updated = await regenerateContentWithFeedback(id, feedback)

    return NextResponse.json({ success: true, item: updated })
  } catch (error: unknown) {
    console.error('Regenerate failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to regenerate content'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
