import { describe, expect, it } from 'vitest'
import { formatFullPackage, formatPlatformForCopy, getPlatformCopyLabel } from '@/lib/content/format-package'
import type { ContentEpisodePayload } from '@/lib/agent/types'

const samplePayload: ContentEpisodePayload = {
  platforms: ['linkedin', 'x'],
  strategyNote: 'Focus on thought leadership around AI agents in production.',
  agentReasoning: 'LinkedIn resonates with this audience; X for a punchy hook.',
  content: {
    linkedin: { format: 'POST', hook: 'Most AI agents fail in production.', body: 'Here is why — and what actually works.', hashtags: ['AI', 'Marketing'], cta: 'Follow for more.' },
    x: { format: 'POST', hook: 'Hot take:', body: 'Your AI agent is not broken. Your approval workflow is.', hashtags: ['AI'] },
  },
}

describe('formatPlatformForCopy', () => {
  it('formats LinkedIn post with hashtags', () => {
    const text = formatPlatformForCopy('linkedin', samplePayload.content)
    expect(text).toContain('Most AI agents fail in production.')
    expect(text).toContain('#AI')
  })
})

describe('formatFullPackage', () => {
  it('includes topic, strategy, and platform sections', () => {
    const full = formatFullPackage('AI agents in prod', samplePayload)
    expect(full).toContain('Topic: AI agents in prod')
    expect(full).toContain('## Strategy')
  })
})

describe('getPlatformCopyLabel', () => {
  it('returns human labels', () => {
    expect(getPlatformCopyLabel('linkedin')).toBe('Copy LinkedIn post')
  })
})