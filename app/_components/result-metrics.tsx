import { formatBytes, formatDuration, formatNumber } from '@/lib/format/format'
import type { EvaluateResponse, StateKind } from '@/types/jev-api'
import styles from './evaluate.module.css'

const stateKindLabels: Record<StateKind, string> = {
  text: 'テキスト',
  'text-json': 'テキスト（JSON）',
  file: 'ファイル',
  'file-json': 'ファイル（JSON）',
  combined: 'テキスト + ファイル',
}

export function ResultMetrics({ evaluation }: { evaluation: EvaluateResponse }) {
  const { metrics, usage } = evaluation
  const items: { label: string; value: string }[] = [
    { label: 'モデル', value: evaluation.model },
    { label: 'state', value: stateKindLabels[evaluation.stateKind] },
    { label: 'jev 実行時間', value: formatDuration(metrics.jevDurationMs) },
    { label: '処理全体', value: formatDuration(metrics.totalDurationMs) },
    { label: '入力トークン', value: usage ? formatNumber(usage.inputTokens) : '—' },
    { label: '出力トークン', value: usage ? formatNumber(usage.outputTokens) : '—' },
    { label: 'リクエスト', value: formatBytes(metrics.requestBytes) },
    { label: 'レスポンス', value: formatBytes(metrics.responseBytes) },
    { label: '入力テキスト', value: formatBytes(metrics.inputTextBytes) },
    { label: '入力ファイル', value: formatBytes(metrics.inputFileBytes) },
    {
      label: '抽出文字数',
      value: metrics.extractedChars === null ? '—' : formatNumber(metrics.extractedChars),
    },
    { label: '質問数', value: formatNumber(metrics.questionCount) },
  ]
  return (
    <dl className={styles.metrics}>
      {items.map((item) => (
        <div key={item.label} className={styles.metric}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
