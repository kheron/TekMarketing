import { callAI } from '@/lib/ai/call-ai'

interface XAIChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CallXAIParams {
  messages: XAIChatMessage[]
  model?: string
  temperature?: number
  purpose: string
  relatedContentId?: string
  relatedAgentRunId?: string
}

/** Backward-compatible xAI wrapper — delegates to unified callAI */
export async function callXAI(params: CallXAIParams) {
  const result = await callAI({
    provider: 'xai',
    messages: params.messages,
    model: params.model,
    temperature: params.temperature,
    purpose: params.purpose,
    jsonMode: true,
    relatedContentId: params.relatedContentId,
    relatedAgentRunId: params.relatedAgentRunId,
  })

  return {
    choices: [{ message: { content: result.content } }],
    usage: {
      prompt_tokens: result.usage.promptTokens,
      completion_tokens: result.usage.completionTokens,
      total_tokens: result.usage.totalTokens,
    },
  }
}