import { NextRequest, NextResponse } from 'next/server'
import { licenseGuardResponse } from '@/lib/api/license-guard'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { brandContextToBusinessProfile } from '@/lib/agent/brand-adapter'
import { regenerateEpisodeSection } from '@/lib/agent/regenerate-episode'
import { AIProviderSchema, ContentEpisodePayloadSchema, SocialPlatformSchema } from '@/lib/agent/types'
import { getActiveProvider } from '@/lib/settings/api-key'

const RequestSchema = z.object({ packageId: z.string(), platform: SocialPlatformSchema, feedback: z.string().min(1), provider: AIProviderSchema.optional() })

export async function POST(request: NextRequest) {
  const blocked = licenseGuardResponse()
  if (blocked) return blocked

  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    const pkg = await prisma.contentPackage.findUnique({ where: { id: parsed.data.packageId }, include: { brandContext: true } })
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    const provider = parsed.data.provider ?? (await getActiveProvider())
    const business = brandContextToBusinessProfile(pkg.brandContext)
    const currentPayload = ContentEpisodePayloadSchema.parse({ platforms: pkg.platforms as string[], strategyNote: pkg.strategyNote, agentReasoning: pkg.agentReasoning, content: pkg.content })
    const result = await regenerateEpisodeSection({ provider, business, topic: pkg.topic, platform: parsed.data.platform, currentPayload, feedback: parsed.data.feedback })
    const updated = await prisma.contentPackage.update({ where: { id: pkg.id }, data: { strategyNote: result.payload.strategyNote, agentReasoning: result.payload.agentReasoning, content: result.payload.content } })
    await prisma.activityLog.create({ data: { type: 'CONTENT_REGENERATED', summary: `Regenerated ${parsed.data.platform} content with feedback`, details: { packageId: pkg.id, platform: parsed.data.platform } } })
    return NextResponse.json({ package: { id: updated.id, businessId: updated.brandContextId, topic: updated.topic, provider: updated.provider, platforms: updated.platforms, strategyNote: updated.strategyNote, agentReasoning: updated.agentReasoning, content: updated.content, createdAt: updated.createdAt.toISOString() }, model: result.model, usage: result.usage })
  } catch (error: unknown) {
    console.error('Regenerate failed:', error)
    const message = error instanceof Error ? error.message : 'Regeneration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}