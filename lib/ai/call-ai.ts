import type { AIProvider } from '@/lib/agent/types'
import { getDefaultModel } from '@/lib/constants/ai-providers'
import { getApiKey } from '@/lib/settings/api-key'
import { logApiUsage } from '@/lib/ai/usage'
import {
  callProvider,
  type ChatMessage,
  type ProviderCallResult,
} from '@/lib/ai/providers'

export type { ChatMessage, ProviderCallResult }

export interface CallAIParams {
  provider: AIProvider
  messages: ChatMessage[]
  model?: string
  temperature?: number
  purpose: string
  jsonMode?: boolean
  maxTokens?: number
  relatedContentId?: string
  relatedAgentRunId?: string
}

/**
 * Unified server-side AI entry point.
 * API keys are resolved from encrypted DB settings or environment variables.
 */
export async function callAI(params: CallAIParams): Promise<ProviderCallResult> {
  const {
    provider,
    messages,
    model = getDefaultModel(provider),
    temperature = 0.65,
    purpose,
    jsonMode = false,
    maxTokens,
    relatedContentId,
    relatedAgentRunId,
  } = params

  const apiKey = await getApiKey(provider)
  if (!apiKey) {
    throw new Error(
      `No API key configured for ${provider}. Add it in Settings or set the environment variable.`
    )
  }

  const result = await callProvider({
    provider,
    apiKey,
    messages,
    model,
    temperature,
    jsonMode,
    maxTokens,
  })

  await logApiUsage({
    provider,
    model: result.model,
    purpose,
    promptTokens: result.usage.promptTokens,
    completionTokens: result.usage.completionTokens,
    totalTokens: result.usage.totalTokens,
    estimatedCostUsd: result.usage.estimatedCostUsd,
    relatedContentId,
    relatedAgentRunId,
  })

  return result
}
