import { NextRequest, NextResponse } from 'next/server'
import { licenseGuardResponse } from '@/lib/api/license-guard'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { brandContextToBusinessProfile } from '@/lib/agent/brand-adapter'
import { recommendTopics } from '@/lib/agent/recommend-topic'
import { AIProviderSchema } from '@/lib/agent/types'
import { getActiveProvider } from '@/lib/settings/api-key'

const RequestSchema = z.object({
  brandContextId: z.string(),
  provider: AIProviderSchema.optional(),
  count: z.number().min(3).max(8).optional(),
})

export async function POST(request: NextRequest) {
  const blocked = licenseGuardResponse()
  if (blocked) return blocked

  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const brand = await prisma.brandContext.findUnique({
      where: { id: parsed.data.brandContextId },
    })
    if (!brand) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const provider = parsed.data.provider ?? (await getActiveProvider())
    const business = brandContextToBusinessProfile(brand)

    const result = await recommendTopics({
      provider,
      business,
      count: parsed.data.count ?? 5,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Topic recommendation failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to suggest topics'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}