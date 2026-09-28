import type { ExecutionRecord } from '@/types/execution'
import type { ExecutionSummary } from '@/types/execution-summary'

/** 実行ログを集計する（成功した実行のみを平均・合計の対象にする） */
export function summarizeExecutions(executions: ExecutionRecord[]): ExecutionSummary {
  const succeeded = executions.filter((execution) => execution.status === 'success')
  const durations = succeeded.map((execution) => execution.jevDurationMs)
  let totalInputTokens = 0
  let totalOutputTokens = 0
  for (const execution of succeeded) {
    totalInputTokens += execution.inputTokens ?? 0
    totalOutputTokens += execution.outputTokens ?? 0
  }
  return {
    totalCount: executions.length,
    successCount: succeeded.length,
    errorCount: executions.length - succeeded.length,
    averageJevDurationMs:
      durations.length > 0 ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length) : null,
    totalInputTokens,
    totalOutputTokens,
  }
}
