import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAI } from '@/lib/ai/call-ai'
import { AIProviderSchema } from '@/lib/agent/types'

const RequestSchema = z.object({ provider: AIProviderSchema })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    const result = await callAI({ provider: parsed.data.provider, purpose: 'test_connection', temperature: 0, maxTokens: 16, messages: [{ role: 'user', content: 'Reply with exactly: ok' }] })
    return NextResponse.json({ status: 'ok', model: result.model, preview: result.content.slice(0, 50) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}