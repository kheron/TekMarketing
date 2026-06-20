import { describe, expect, it } from 'vitest'
import { sanitizeEpisodePayload } from '@/lib/agent/sanitize-episode'

describe('sanitizeEpisodePayload', () => {
  it('fills missing social post fields', () => {
    const result = sanitizeEpisodePayload(
      {
        strategyNote: 'Test strategy',
        agentReasoning: 'Test reasoning',
        content: {
          linkedin: { hook: 'Hello', body: 'World' },
        },
      },
      ['linkedin'],
      'clean professional'
    )

    expect(result.platforms).toEqual(['linkedin'])
    expect(result.content.linkedin?.hook).toBe('Hello')
    expect(result.content.linkedin?.body).toBe('World')
    expect(result.content.linkedin?.hashtags.length).toBeGreaterThanOrEqual(3)
  })

  it('defaults strategy when missing', () => {
    const result = sanitizeEpisodePayload({}, ['x'], 'minimal')
    expect(result.strategyNote.length).toBeGreaterThan(10)
    expect(result.content.x?.body).toBeTruthy()
  })
})
