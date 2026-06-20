import { ContentProposal, PlanningCycleResult, PlanningCycleResultSchema } from './types'
import { callXAI } from '@/lib/ai/xai-client'

// Lazy import to avoid crashing the route module load while Prisma client is unstable
let prisma: any
async function getPrisma() {
  if (!prisma) {
    const { prisma: client } = await import('@/lib/db/prisma')
    prisma = client
  }
  return prisma
}

/**
 * Main entry point for running an autonomous planning cycle.
 * This is the "marketing manager brain".
 */
export async function runPlanningCycle(trigger: 'manual' | 'scheduled' = 'manual') {
  console.log('🧠 Starting planning cycle...')

  const db = await getPrisma()

  // 1. Load Brand Context
  const brand = await db.brandContext.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  }) ?? await db.brandContext.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (!brand) {
    throw new Error('No brand context found. Please set up your brand first.')
  }

  // 2. Load recent memory (last 14 days of activity + content)
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)

  const [recentActivity, recentContent] = await Promise.all([
    db.activityLog.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
      take: 15,
    }),
    db.contentItem.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ])

  // 3. Build rich context for the model
  const contextSummary = buildContextSummary(brand, recentActivity, recentContent)

  // 4. Persist run start + log planning kickoff
  const agentRun = await db.agentRun.create({
    data: {
      trigger,
      status: 'running',
      startedAt: new Date(),
      goals: brand.primaryGoals,
      contextSnapshot: {
        brandSnapshot: {
          companyName: brand.companyName,
          voice: brand.voiceDescription.slice(0, 200),
        },
        recentActivityCount: recentActivity.length,
        recentContentCount: recentContent.length,
      },
    },
  })

  await db.activityLog.create({
    data: {
      type: 'AGENT_PLANNING_STARTED',
      summary: `Started ${trigger} planning cycle for ${brand.companyName}`,
      details: { trigger, brandId: brand.id },
      agentRunId: agentRun.id,
    },
  })

  // 5. Call xAI for a slightly smart planning cycle
  const result = await generatePlanWithAI(brand, contextSummary, agentRun.id)

  // 6. Persist results
  await db.agentRun.update({
    where: { id: agentRun.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      summary: result.strategyNote,
    },
  })

  // Save proposals as ContentItems
  const createdItems = []
  for (const proposal of result.proposals) {
    const item = await db.contentItem.create({
      data: {
        platform: proposal.platform,
        format: proposal.format,
        title: proposal.title || null,
        body: proposal.body,
        suggestedMedia: proposal.suggestedMedia || null,
        status: 'PENDING_APPROVAL',
        agentReasoning: proposal.agentReasoning,
        confidence: proposal.confidence,
        createdBy: 'agent',
      },
    })
    createdItems.push(item)

    await db.activityLog.create({
      data: {
        type: 'CONTENT_GENERATED',
        summary: `Generated ${proposal.platform} ${proposal.format.toLowerCase()}: ${proposal.title || proposal.body.slice(0, 80)}`,
        details: {
          platform: proposal.platform,
          format: proposal.format,
          reasoning: proposal.agentReasoning,
        },
        agentRunId: agentRun.id,
        contentItemId: item.id,
      },
    })
  }

  // Log the cycle
  await db.activityLog.create({
    data: {
      type: 'AGENT_PLANNING_COMPLETED',
      summary: `Planning cycle completed — ${result.proposals.length} proposals ready for review`,
      details: {
        strategyNote: result.strategyNote,
        proposalCount: result.proposals.length,
        platforms: [...new Set(result.proposals.map(p => p.platform))],
      },
      agentRunId: agentRun.id,
    },
  })

  console.log(`✅ Planning cycle finished. Created ${createdItems.length} proposals.`)

  return {
    agentRunId: agentRun.id,
    strategyNote: result.strategyNote,
    proposalsCreated: createdItems.length,
  }
}

// ============================================
// Helpers
// ============================================

function buildContextSummary(brand: any, activity: any[], content: any[]) {
  const recentApproved = content
    .filter(c => c.status === 'APPROVED' || c.status === 'PUBLISHED')
    .slice(0, 5)
    .map(c => `- ${c.platform}: ${c.title || c.body.slice(0, 80)}...`)

  const recentRejected = content
    .filter(c => c.status === 'REJECTED')
    .slice(0, 3)
    .map(c => `- ${c.platform}: ${c.title || c.body.slice(0, 60)}... (rejected)`)

  return `
BRAND:
- Company: ${brand.companyName}
- Voice: ${brand.voiceDescription}
- Audience: ${brand.targetAudience}
- Goals: ${brand.primaryGoals}
- Tone: ${brand.toneKeywords || 'Not specified'}
- Avoid: ${brand.doNotSay || 'None specified'}

RECENT PERFORMANCE SIGNALS:
${recentApproved.length > 0 ? recentApproved.join('\n') : 'No recently approved content in memory.'}

${recentRejected.length > 0 ? 'RECENTLY REJECTED:\n' + recentRejected.join('\n') : ''}

RECENT AGENT ACTIVITY (last 2 weeks):
${activity.slice(0, 8).map(a => `- ${a.summary}`).join('\n') || 'Limited history'}
`.trim()
}

import { PLANNING_SYSTEM_PROMPT } from './prompts/planning'

async function generatePlanWithAI(
  brand: any,
  contextSummary: string,
  agentRunId?: string
): Promise<PlanningCycleResult> {
  const systemPrompt = PLANNING_SYSTEM_PROMPT(brand.companyName) + `

You MUST return valid JSON with this EXACT structure:

{
  "strategyNote": "Short 2-4 sentence explanation of your strategy for this cycle",
  "proposals": [
    {
      "platform": "X" or "LINKEDIN"   <--- ONLY these two values allowed
      "format": "POST" or "THREAD"    <--- ONLY these two values allowed for now
      "title": "optional short headline",
      "body": "the full text of the post/thread",
      "agentReasoning": "Why this content right now + what result you expect",
      "confidence": number between 0.5 and 0.95
    }
  ]
}

CRITICAL RULES:
- platform can ONLY be "X" or "LINKEDIN"
- format can ONLY be "POST" or "THREAD"
- Always return 4 to 6 proposals
- Never invent new platform or format values
- Always include body and agentReasoning for every proposal
- Be slightly strategic but realistic`

  const userPrompt = `Here is the current context:

${contextSummary}

Run a planning cycle and return **only** the JSON object with the exact structure defined above.
Do NOT use any platform or format values other than the ones explicitly allowed.`

  const data = await callXAI({
    model: 'grok-3',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.65,
    purpose: 'planning_cycle',
    relatedAgentRunId: agentRunId,
  })

  const raw = data.choices?.[0]?.message?.content

  if (!raw) throw new Error('No content returned from xAI')

  // Parse the JSON
  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Failed to parse JSON from agent')
  }

  // === Sanitize proposals (very important for reliability) ===
  if (parsed.proposals && Array.isArray(parsed.proposals)) {
    parsed.proposals = parsed.proposals.map((p: any) => ({
      platform: ['X', 'LINKEDIN'].includes(p.platform) ? p.platform : 'X',
      format: ['POST', 'THREAD', 'CAROUSEL', 'IMAGE'].includes(p.format) ? p.format : 'POST',
      title: p.title || undefined,
      body: p.body || p.content || 'Content generated by agent.',
      suggestedMedia: p.suggestedMedia || p.media || undefined,
      agentReasoning: p.agentReasoning || p.reasoning || 'Strategic content for current goals.',
      confidence: typeof p.confidence === 'number' ? p.confidence : 0.7,
    }))
  }

  // Validate with Zod (now much more likely to pass)
  const validated = PlanningCycleResultSchema.safeParse(parsed)

  if (!validated.success) {
    console.error('Validation still failed after sanitization:', validated.error)
    // Last resort fallback: return something usable instead of crashing
    return {
      strategyNote: parsed.strategyNote || 'Generated content based on brand context.',
      proposals: parsed.proposals?.length ? parsed.proposals : [
        {
          platform: 'X',
          format: 'POST',
          body: 'Content generated by the agent.',
          agentReasoning: 'Fallback proposal created due to parsing issues.',
          confidence: 0.5,
        },
      ],
    }
  }

  return validated.data
}

// ============================================
// Regenerate a single content item with feedback
// ============================================
export async function regenerateContentWithFeedback(
  contentItemId: string,
  feedback: string
) {
  const db = await getPrisma()

  const item = await db.contentItem.findUnique({ where: { id: contentItemId } })
  if (!item) throw new Error('Content item not found')

  const brand = await db.brandContext.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  }) ?? await db.brandContext.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (!brand) throw new Error('No brand context')

  const systemPrompt = `You are a senior marketing manager for ${brand.companyName}.

You are regenerating one specific piece of content based on human feedback.

Return a JSON object with this exact structure:
{
  "body": "the full updated content",
  "title": "optional updated title or null",
  "agentReasoning": "updated reasoning explaining the changes you made based on the feedback"
}`

  const userPrompt = `Original content:
Platform: ${item.platform}
Format: ${item.format}
${item.title ? `Title: ${item.title}\n` : ''}
Body:
${item.body}

Original reasoning:
${item.agentReasoning || 'N/A'}

Human feedback / instructions:
"${feedback}"

Please regenerate an improved version following the instructions above.`

  const data = await callXAI({
    model: 'grok-3',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    purpose: 'regenerate',
    relatedContentId: contentItemId,
  })

  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('No content returned from xAI during regeneration')

  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Failed to parse regeneration response')
  }

  // Update the item
  const updated = await db.contentItem.update({
    where: { id: contentItemId },
    data: {
      body: parsed.body || item.body,
      title: parsed.title ?? item.title,
      agentReasoning: parsed.agentReasoning || `Regenerated based on feedback: ${feedback}`,
      status: 'PENDING_APPROVAL', // reset to pending after regeneration
    },
  })

  // Log activity
  await db.activityLog.create({
    data: {
      type: 'CONTENT_REGENERATED',
      summary: `Regenerated ${item.platform} content with feedback`,
      details: { feedback, contentItemId },
      contentItemId,
    },
  })

  return updated
}
