import { describe, expect, it } from 'vitest'
import { normalizeAnswer, normalizeAnswers, normalizeUsage } from '@/lib/jev/answer-normalizer'

describe('normalizeAnswer', () => {
  it('API リファレンスの 3 種類の回答を型付きにする', () => {
    expect(normalizeAnswer({ type: 'noul', noul: 0.95 })).toEqual({ type: 'noul', noul: 0.95 })
    expect(
      normalizeAnswer({
        type: 'choice',
        choice: 'billing',
        probabilities: { billing: 0.88, technical: 0.12, sales: 0.0 },
        confidence: 0.81,
      }),
    ).toMatchObject({ type: 'choice', choice: 'billing', confidence: 0.81 })
    expect(
      normalizeAnswer({
        type: 'score',
        score: 1.05,
        legend: { '0': 'Calm', '1': 'Frustrated', '2': 'Very angry' },
        probabilities: { '0': 0.0, '1': 0.95, '2': 0.05 },
        confidence: 0.92,
      }),
    ).toMatchObject({ type: 'score', score: 1.05 })
  })

  it('形式が崩れた回答は unknown として生データを保持する', () => {
    expect(normalizeAnswer({ type: 'noul', noul: 'high' })).toEqual({ type: 'unknown', raw: { type: 'noul', noul: 'high' } })
    expect(normalizeAnswer({ type: 'future', value: 1 })).toMatchObject({ type: 'unknown' })
    expect(normalizeAnswer('x')).toEqual({ type: 'unknown', raw: 'x' })
  })
})

describe('normalizeAnswers', () => {
  it('質問の定義順に並べ、欠けた回答は unknown にする', () => {
    const items = normalizeAnswers(['b', 'a', 'constructor'], { a: { type: 'noul', noul: 1 }, b: { type: 'noul', noul: 0 } })
    expect(items.map((item) => item.id)).toEqual(['b', 'a', 'constructor'])
    expect(items[2]?.answer).toEqual({ type: 'unknown', raw: null })
  })
})

describe('normalizeUsage', () => {
  it('usage をトークン数に変換する', () => {
    expect(normalizeUsage({ input_tokens: 296, output_tokens: 20 })).toEqual({ inputTokens: 296, outputTokens: 20 })
  })

  it('取得できない場合は null', () => {
    expect(normalizeUsage(undefined)).toBeNull()
    expect(normalizeUsage({ input_tokens: 1 })).toBeNull()
  })
})
