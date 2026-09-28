import { summarizeExecutions } from '@/lib/executions/summarize-executions'
import { formatDuration, formatNumber } from '@/lib/format/format'
import type { ExecutionRecord } from '@/types/execution'
import styles from './history.module.css'

export function HistorySummary({ executions }: { executions: ExecutionRecord[] }) {
  const summary = summarizeExecutions(executions)
  const items = [
    { label: '実行回数', value: formatNumber(summary.totalCount) },
    { label: '成功 / 失敗', value: `${formatNumber(summary.successCount)} / ${formatNumber(summary.errorCount)}` },
    {
      label: '平均 jev 実行時間',
      value: summary.averageJevDurationMs === null ? '—' : formatDuration(summary.averageJevDurationMs),
    },
    { label: '入力トークン合計', value: formatNumber(summary.totalInputTokens) },
    { label: '出力トークン合計', value: formatNumber(summary.totalOutputTokens) },
  ]
  return (
    <dl className={styles.summary}>
      {items.map((item) => (
        <div key={item.label} className={`card ${styles.summaryItem}`}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
