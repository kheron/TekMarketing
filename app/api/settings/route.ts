import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIProviderSchema, type AIProvider } from '@/lib/agent/types'
import { getApiKeyStatus, saveApiKey, removeApiKey, getActiveProvider, saveActiveProvider, getMonthlyBudget, saveMonthlyBudget } from '@/lib/settings/api-key'
import { AI_PROVIDERS } from '@/lib/constants/ai-providers'

export async function GET() {
  try {
    const [activeProvider, monthlyBudgetUsd, providers] = await Promise.all([getActiveProvider(), getMonthlyBudget(), Promise.all(AI_PROVIDERS.map(async (p) => ({ id: p.id, label: p.label, ...(await getApiKeyStatus(p.id)) })))]);
    return NextResponse.json({ activeProvider, monthlyBudgetUsd, providers })
  } catch (error) {
    console.error('Failed to load settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

const PostSchema = z.object({ provider: AIProviderSchema.optional(), apiKey: z.string().min(8).optional(), activeProvider: AIProviderSchema.optional(), monthlyBudgetUsd: z.number().min(0).nullable().optional() })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
    if (parsed.data.apiKey && parsed.data.provider) await saveApiKey(parsed.data.provider, parsed.data.apiKey)
    if (parsed.data.activeProvider) await saveActiveProvider(parsed.data.activeProvider)
    if (parsed.data.monthlyBudgetUsd !== undefined) await saveMonthlyBudget(parsed.data.monthlyBudgetUsd)
    return GET()
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') as AIProvider | null
    if (!provider || !AIProviderSchema.safeParse(provider).success) return NextResponse.json({ error: 'Provider required' }, { status: 400 })
    await removeApiKey(provider)
    return GET()
  } catch (error) {
    console.error('Failed to remove API key:', error)
    return NextResponse.json({ error: 'Failed to remove API key' }, { status: 500 })
  }
}