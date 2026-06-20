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

  it('normalizes legacy seed package shapes', () => {
    const result = sanitizeEpisodePayload(
      {
        strategyNote: 'Lead with pain, then offer a fix.',
        agentReasoning: 'Cross-platform narrative with format-native delivery.',
        content: {
          linkedin: { post: 'Last-touch attribution is seductive because it is simple.' },
          x: { thread: ['Line one.', 'Line two.'] },
          youtube_short: {
            hook: 'Stop using last-touch.',
            script: 'If your model only credits the last click, you are optimizing for closers.',
          },
        },
      },
      ['linkedin', 'x', 'youtube_short'],
      'clean professional'
    )

    expect(result.content.linkedin?.body).toContain('Last-touch')
    expect(result.content.x?.format).toBe('THREAD')
    expect(result.content.x?.body).toContain('Line two.')
    expect(result.content.youtube_short?.script.body).toContain('last click')
    expect(result.content.youtube_short?.youtube.titleOptions.length).toBeGreaterThanOrEqual(3)
  })
})
