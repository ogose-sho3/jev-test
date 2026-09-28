import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insertExecution } from '@/lib/executions/execution-store'
import { evaluate } from '@/lib/jev/evaluate-service'
import { callJev } from '@/lib/jev/jev-gateway'
import { appErrors } from '@/models/errors'

vi.mock('@/lib/jev/jev-gateway', () => ({ callJev: vi.fn() }))
vi.mock('@/lib/executions/execution-store', () => ({ insertExecution: vi.fn() }))

const user = { id: 'user-1', email: 'taro@sho-san.co.jp' }
const supabase = {} as SupabaseClient
const questions = JSON.stringify({
  is_urgent: { type: 'noul', instructions: 'Is it urgent?' },
  team: { type: 'choice', instructions: 'Which team?', criteria: { billing: null, technical: null } },
})

function form(fields: Record<string, string | File>): FormData {
  const formData = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value)
  }
  return formData
}

describe('evaluate', () => {
  beforeEach(() => {
    vi.mocked(callJev).mockReset()
    vi.mocked(insertExecution).mockReset()
    vi.mocked(insertExecution).mockResolvedValue(true)
  })

  it('jev を呼び出し、回答と計測値を返してメタデータのみ記録する', async () => {
    vi.mocked(callJev).mockResolvedValue({
      ok: true,
      model: 'jev-1.13.0',
      answers: {
        team: { type: 'choice', choice: 'billing', probabilities: { billing: 0.9, technical: 0.1 }, confidence: 0.8 },
        is_urgent: { type: 'noul', noul: 0.95 },
      },
      usage: { input_tokens: 296, output_tokens: 20 },
      durationMs: 120,
      responseBytes: 321,
    })

    const outcome = await evaluate(
      form({ text: '至急お願いします', questions, model: 'jev-latest', file: new File(['memo body'], 'memo.txt') }),
      user,
      supabase,
    )

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) {
      return
    }
    expect(vi.mocked(callJev).mock.calls[0]?.[0]).toMatchObject({
      model: 'jev-latest',
      state: { text: '至急お願いします', file: { name: 'memo.txt', content: 'memo body' } },
    })
    expect(outcome.response.answers.map((item) => item.id)).toEqual(['is_urgent', 'team'])
    expect(outcome.response.usage).toEqual({ inputTokens: 296, outputTokens: 20 })
    expect(outcome.response.metrics).toMatchObject({
      questionCount: 2,
      inputTextBytes: 24,
      inputFileBytes: 9,
      inputFileKind: 'text',
      responseBytes: 321,
      jevDurationMs: 120,
    })
    expect(outcome.response.recorded).toBe(true)

    const [, userId, record] = vi.mocked(insertExecution).mock.calls[0] ?? []
    expect(userId).toBe('user-1')
    expect(record).toMatchObject({
      status: 'success',
      requestedModel: 'jev-latest',
      resolvedModel: 'jev-1.13.0',
      inputTokens: 296,
      outputTokens: 20,
    })
    // 入力内容・ファイル名・回答は記録しない
    const serializedRecord = JSON.stringify(record)
    expect(serializedRecord).not.toContain('至急')
    expect(serializedRecord).not.toContain('memo')
    expect(serializedRecord).not.toContain('billing')
  })

  it('jev の失敗も実行ログに記録し、エラーを返す', async () => {
    vi.mocked(callJev).mockResolvedValue({
      ok: false,
      appError: appErrors.jevRejected,
      httpStatus: 422,
      durationMs: 50,
      details: 'questions.q: bad',
    })

    const outcome = await evaluate(form({ text: 'hello', questions }), user, supabase)

    expect(outcome).toEqual({ ok: false, appError: appErrors.jevRejected, details: 'questions.q: bad' })
    expect(vi.mocked(insertExecution).mock.calls[0]?.[2]).toMatchObject({
      status: 'error',
      errorCode: 'JevRejected',
      httpStatus: 422,
      requestedModel: 'jev-latest',
      responseBytes: null,
      inputTokens: null,
    })
  })

  it('記録に失敗しても結果は返し、recorded=false にする', async () => {
    vi.mocked(callJev).mockResolvedValue({
      ok: true,
      model: 'jev-1.13.0',
      answers: {},
      usage: null,
      durationMs: 1,
      responseBytes: 1,
    })
    vi.mocked(insertExecution).mockResolvedValue(false)

    const outcome = await evaluate(form({ text: 'hello', questions }), user, supabase)
    expect(outcome.ok && outcome.response.recorded).toBe(false)
  })

  it.each([
    ['質問 JSON 不正', { text: 'hello', questions: '{' }],
    ['state なし', { text: ' ', questions }],
    ['未対応モデル', { text: 'hello', questions, model: 'gpt-5' }],
  ])('%s は jev を呼ばずに 400 を返す', async (_label, fields) => {
    const outcome = await evaluate(form(fields), user, supabase)
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) {
      expect(outcome.appError).toBe(appErrors.badRequest)
    }
    expect(callJev).not.toHaveBeenCalled()
    expect(insertExecution).not.toHaveBeenCalled()
  })

  it('未対応ファイルは 415 を返す', async () => {
    const outcome = await evaluate(form({ questions, file: new File(['x'], 'a.png') }), user, supabase)
    expect(outcome).toEqual({ ok: false, appError: appErrors.unsupportedFile })
    expect(callJev).not.toHaveBeenCalled()
  })
})
