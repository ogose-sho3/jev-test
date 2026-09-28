import { describe, expect, it } from 'vitest'
import { summarizeExecutions } from '@/lib/executions/summarize-executions'
import type { ExecutionRecord } from '@/types/execution'

const base: ExecutionRecord = {
  id: '1',
  createdAt: '2026-09-28T00:00:00Z',
  status: 'success',
  errorCode: null,
  httpStatus: 200,
  requestedModel: 'jev-latest',
  resolvedModel: 'jev-1.13.0',
  questionCount: 1,
  inputTextBytes: 10,
  inputFileBytes: null,
  inputFileKind: null,
  requestBytes: 100,
  responseBytes: 50,
  jevDurationMs: 100,
  totalDurationMs: 120,
  inputTokens: 300,
  outputTokens: 20,
}

describe('summarizeExecutions', () => {
  it('成功分のみで平均・合計を出す', () => {
    const summary = summarizeExecutions([
      base,
      { ...base, id: '2', jevDurationMs: 300, inputTokens: 100, outputTokens: null },
      { ...base, id: '3', status: 'error', jevDurationMs: 5000, inputTokens: null, outputTokens: null },
    ])
    expect(summary).toEqual({
      totalCount: 3,
      successCount: 2,
      errorCount: 1,
      averageJevDurationMs: 200,
      totalInputTokens: 400,
      totalOutputTokens: 20,
    })
  })

  it('空なら平均は null', () => {
    expect(summarizeExecutions([]).averageJevDurationMs).toBeNull()
  })
})
