import type { AIProvider } from '@/lib/agent/types'
import { prisma } from '@/lib/db/prisma'

const TOKEN_RATES: Record<string, number> = {
  'gpt-4o': 0.000005,
  'gpt-4o-mini': 0.0000015,
  'claude-sonnet-4-20250514': 0.000005,
  'claude-3-5-haiku-20241022': 0.000001,
  'grok-3': 0.000005,
  'grok-3-latest': 0.000005,
  'gemini-2.0-flash': 0.00000035,
  'gemini-2.5-flash-preview-05-20': 0.00000035,
  'gemini-1.5-pro': 0.0000035,
}

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

interface LogUsageParams {
  provider?: AIProvider | string
  model: string
  purpose: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  estimatedCostUsd?: number
  relatedContentId?: string
  relatedAgentRunId?: string
}

export async function logApiUsage(params: LogUsageParams) {
  try {
    await prisma.apiUsageLog.create({
      data: {
        provider: params.provider ?? 'xai',
        model: params.model,
        purpose: params.purpose,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.totalTokens,
        estimatedCostUsd: params.estimatedCostUsd,
        relatedContentId: params.relatedContentId,
        relatedAgentRunId: params.relatedAgentRunId,
      },
    })
  } catch (e) {
    console.error('Failed to log API usage:', e)
  }
}

export function estimateCost(model: string, totalTokens: number): number {
  const rate = TOKEN_RATES[model] ?? 0.000005
  return totalTokens * rate
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(2)}`
}

const PURPOSE_LABELS: Record<string, string> = {
  generate_episode: 'Content generation',
  regenerate_episode: 'Platform regenerate',
  test_connection: 'Connection test',
  brand_analysis: 'Website analysis',
  planning_cycle: 'Planning cycle',
  regenerate: 'Content regenerate',
  recommend_topics: 'Topic suggestions',
}

export function formatUsagePurpose(purpose: string): string {
  if (PURPOSE_LABELS[purpose]) return PURPOSE_LABELS[purpose]
  if (purpose.startsWith('image:')) return purpose.replace(/^image:\s*/, 'Image · ')
  return purpose.replace(/_/g, ' ')
}
