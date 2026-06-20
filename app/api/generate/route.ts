import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { brandContextToBusinessProfile } from '@/lib/agent/brand-adapter'
import { generateEpisode } from '@/lib/agent/generate-episode'
import { AIProviderSchema, SocialPlatformSchema } from '@/lib/agent/types'
import { getActiveProvider } from '@/lib/settings/api-key'

const RequestSchema = z.object({ brandContextId: z.string(), topic: z.string().min(2), platforms: z.array(SocialPlatformSchema).min(1), provider: AIProviderSchema.optional() })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    const { brandContextId, topic, platforms } = parsed.data
    const provider = parsed.data.provider ?? (await getActiveProvider())
    const brand = await prisma.brandContext.findUnique({ where: { id: brandContextId } })
    if (!brand) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    const business = brandContextToBusinessProfile(brand)
    const result = await generateEpisode({ provider, business, topic, platforms })
    const saved = await prisma.contentPackage.create({ data: { brandContextId, topic, provider, platforms, strategyNote: result.payload.strategyNote, agentReasoning: result.payload.agentReasoning, content: result.payload.content } })
    await prisma.activityLog.create({ data: { type: 'CONTENT_GENERATED', summary: `Generated content package for "${topic}" (${platforms.join(', ')})`, details: { packageId: saved.id, platforms, provider, model: result.model } } })
    return NextResponse.json({ package: { id: saved.id, businessId: saved.brandContextId, topic: saved.topic, provider: saved.provider, platforms: saved.platforms, strategyNote: saved.strategyNote, agentReasoning: saved.agentReasoning, content: saved.content, createdAt: saved.createdAt.toISOString() }, model: result.model, usage: result.usage })
  } catch (error: unknown) {
    console.error('Generate failed:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}