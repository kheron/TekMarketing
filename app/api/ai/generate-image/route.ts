import { NextRequest, NextResponse } from 'next/server'
import { licenseGuardResponse } from '@/lib/api/license-guard'
import { z } from 'zod'
import { generateImage } from '@/lib/ai/generate-image'
import { getApiKey } from '@/lib/settings/api-key'
import { resolveImageProvider } from '@/lib/constants/image-generation'
import { logApiUsage } from '@/lib/ai/usage'
import { AIProviderSchema } from '@/lib/agent/types'

const RequestSchema = z.object({ prompt: z.string().min(10), provider: AIProviderSchema.optional(), aspectRatio: z.enum(['square', 'landscape', 'portrait']).optional() })

export async function POST(request: NextRequest) {
  const blocked = licenseGuardResponse()
  if (blocked) return blocked

  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    const preferred = parsed.data.provider ?? 'xai'
    const imageProvider = await resolveImageProvider(preferred)
    if (!imageProvider) return NextResponse.json({ error: 'No API key configured for image generation (xAI, OpenAI, or Google)' }, { status: 400 })
    const apiKey = await getApiKey(imageProvider)
    if (!apiKey) return NextResponse.json({ error: `No API key for ${imageProvider} image generation` }, { status: 400 })
    const result = await generateImage({ provider: imageProvider, apiKey, prompt: parsed.data.prompt, aspectRatio: parsed.data.aspectRatio ?? 'landscape' })
    await logApiUsage({ provider: imageProvider, model: result.model, purpose: `image: ${parsed.data.prompt.slice(0, 40)}`, estimatedCostUsd: result.estimatedCostUsd })
    return NextResponse.json({ image: result.image, provider: result.provider, model: result.model, estimatedCostUsd: result.estimatedCostUsd })
  } catch (error: unknown) {
    console.error('Image generation failed:', error)
    const message = error instanceof Error ? error.message : 'Image generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}