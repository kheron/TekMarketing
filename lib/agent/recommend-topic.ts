import type { AIProvider, BusinessProfile } from '@/lib/agent/types'
import { buildBusinessContextBlock } from '@/lib/agent/context'
import { callAI } from '@/lib/ai/call-ai'
import { safeParseJsonResponse } from '@/lib/ai/parse-response'

export interface TopicSuggestion {
  topic: string
  angle: string
  whyNow: string
}

export interface RecommendTopicsResult {
  suggestions: TopicSuggestion[]
  model: string
}

export async function recommendTopics(params: {
  provider: AIProvider
  business: BusinessProfile
  count?: number
}): Promise<RecommendTopicsResult> {
  const { provider, business, count = 5 } = params
  const context = buildBusinessContextBlock(business)

  const result = await callAI({
    provider,
    purpose: 'recommend_topics',
    temperature: 0.75,
    jsonMode: true,
    maxTokens: 2048,
    messages: [
      {
        role: 'system',
        content: `You are a senior content strategist. Suggest timely, high-engagement topics for social media content.
Return valid JSON only.`,
      },
      {
        role: 'user',
        content: `${context}

Suggest exactly ${count} content topics this brand should post about in the next 1–2 weeks.

Each topic should be:
- Specific enough to generate a full content package (not vague like "marketing tips")
- Aligned with brand voice, audience, and goals
- Timely or evergreen with a fresh angle

Return JSON:
{
  "suggestions": [
    {
      "topic": "One clear sentence describing what to post about (this becomes the generation prompt)",
      "angle": "Short hook angle in 5-12 words",
      "whyNow": "One sentence on why this works for this brand right now"
    }
  ]
}`,
      },
    ],
  })

  const parsed = safeParseJsonResponse<{ suggestions?: TopicSuggestion[] }>(result.content)
  const raw = parsed?.suggestions ?? []

  const suggestions = raw
    .filter((s) => s?.topic?.trim())
    .slice(0, count)
    .map((s) => ({
      topic: String(s.topic).trim(),
      angle: String(s.angle || '').trim() || 'Fresh angle for your audience',
      whyNow: String(s.whyNow || '').trim() || 'Aligned with your brand goals',
    }))

  if (suggestions.length === 0) {
    throw new Error('Could not generate topic suggestions')
  }

  return { suggestions, model: result.model }
}
