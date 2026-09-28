import { describe, expect, it } from 'vitest'
import { parseQuestions } from '@/lib/jev/questions-validator'

const valid = {
  is_urgent: { type: 'noul', instructions: 'Is it urgent?' },
  department: {
    type: 'choice',
    instructions: 'Which team?',
    criteria: { billing: 'Payments', technical: null, sales: { note: 'Pricing' } },
  },
  frustration: { type: 'score', instructions: { question: 'How frustrated?' }, criteria: ['Calm', 'Angry'] },
}

describe('parseQuestions', () => {
  it('3 種類の質問を受け付け、定義順を保つ', () => {
    const parsed = parseQuestions(JSON.stringify(valid))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(Object.keys(parsed.value)).toEqual(['is_urgent', 'department', 'frustration'])
    }
  })

  it('noul の criteria（true/false）を受け付ける', () => {
    const parsed = parseQuestions(
      JSON.stringify({ q: { type: 'noul', instructions: 'x', criteria: { true: 'yes', false: 'no' } } }),
    )
    expect(parsed.ok).toBe(true)
  })

  it.each([
    ['空文字', ''],
    ['JSON 構文エラー', '{'],
    ['配列', '[]'],
    ['空オブジェクト', '{}'],
  ])('%s を拒否する', (_label, raw) => {
    expect(parseQuestions(raw).ok).toBe(false)
  })

  it('文字列以外を拒否する', () => {
    expect(parseQuestions(null).ok).toBe(false)
  })

  it.each([
    ['type 不正', { q: { type: 'text', instructions: 'x' } }],
    ['instructions なし', { q: { type: 'noul' } }],
    ['instructions 空文字', { q: { type: 'noul', instructions: '  ' } }],
    ['noul criteria に余分なキー', { q: { type: 'noul', instructions: 'x', criteria: { maybe: 'x' } } }],
    ['choice criteria なし', { q: { type: 'choice', instructions: 'x' } }],
    ['choice 選択肢 1 個', { q: { type: 'choice', instructions: 'x', criteria: { a: null } } }],
    ['choice 説明が数値', { q: { type: 'choice', instructions: 'x', criteria: { a: 1, b: 2 } } }],
    ['score 段階 1 個', { q: { type: 'score', instructions: 'x', criteria: ['a'] } }],
    ['score 段階 11 個', { q: { type: 'score', instructions: 'x', criteria: Array.from({ length: 11 }, (_, i) => `l${i}`) } }],
    ['score criteria がオブジェクト', { q: { type: 'score', instructions: 'x', criteria: { a: 'b' } } }],
    ['未対応の項目', { q: { type: 'noul', instructions: 'x', extra: true } }],
  ])('%s を拒否する', (_label, questions) => {
    const parsed = parseQuestions(JSON.stringify(questions))
    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.issues[0]?.path.startsWith('questions')).toBe(true)
    }
  })

  it('choice の選択肢が 255 個を超えると拒否する', () => {
    const criteria = Object.fromEntries(Array.from({ length: 256 }, (_, i) => [`o${i}`, null]))
    expect(parseQuestions(JSON.stringify({ q: { type: 'choice', instructions: 'x', criteria } })).ok).toBe(false)
  })

  it('質問数の上限を超えると拒否する', () => {
    const questions = Object.fromEntries(
      Array.from({ length: 201 }, (_, i) => [`q${i}`, { type: 'noul', instructions: 'x' }]),
    )
    expect(parseQuestions(JSON.stringify(questions)).ok).toBe(false)
  })

  it('__proto__ という質問IDも通常のキーとして扱う', () => {
    const parsed = parseQuestions('{"__proto__": {"type": "noul", "instructions": "x"}}')
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(Object.keys(parsed.value)).toEqual(['__proto__'])
      expect(JSON.stringify(parsed.value)).toBe('{"__proto__":{"type":"noul","instructions":"x"}}')
    }
  })
})
