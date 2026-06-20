import { describe, expect, it } from 'vitest'
import {
  parseJsonResponse,
  safeParseJsonResponse,
  stripJsonFences,
} from '@/lib/ai/parse-response'

describe('stripJsonFences', () => {
  it('removes markdown code fences', () => {
    const raw = '```json\n{"ok": true}\n```'
    expect(stripJsonFences(raw)).toBe('{"ok": true}')
  })
})

describe('parseJsonResponse', () => {
  it('parses clean JSON', () => {
    expect(parseJsonResponse('{"a": 1}')).toEqual({ a: 1 })
  })
})

describe('safeParseJsonResponse', () => {
  it('returns null on invalid JSON', () => {
    expect(safeParseJsonResponse('not json')).toBeNull()
  })

  it('parses fenced JSON', () => {
    const result = safeParseJsonResponse('```json\n{"topic": "test"}\n```')
    expect(result).toEqual({ topic: 'test' })
  })
})
