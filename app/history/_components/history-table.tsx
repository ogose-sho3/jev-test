import { formatBytes, formatDateTime, formatDuration, formatNumber } from '@/lib/format/format'
import type { ExecutionRecord } from '@/types/execution'
import styles from './history.module.css'

const fileKindLabels: Record<NonNullable<ExecutionRecord['inputFileKind']>, string> = {
  text: 'テキスト',
  json: 'JSON',
  pdf: 'PDF',
  docx: 'Word',
}

function formatTokens(tokens: number | null): string {
  return tokens === null ? '—' : formatNumber(tokens)
}

export function HistoryTable({ executions }: { executions: ExecutionRecord[] }) {
  return (
    <div className={`card table-wrap ${styles.tableCard}`}>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">日時</th>
            <th scope="col">結果</th>
            <th scope="col">モデル</th>
            <th scope="col" className="num">
              質問数
            </th>
            <th scope="col" className="num">
              入力テキスト
            </th>
            <th scope="col">ファイル</th>
            <th scope="col" className="num">
              リクエスト
            </th>
            <th scope="col" className="num">
              レスポンス
            </th>
            <th scope="col" className="num">
              jev 実行時間
            </th>
            <th scope="col" className="num">
              処理全体
            </th>
            <th scope="col" className="num">
              入力トークン
            </th>
            <th scope="col" className="num">
              出力トークン
            </th>
          </tr>
        </thead>
        <tbody>
          {executions.map((execution) => (
            <tr key={execution.id}>
              <td>{formatDateTime(execution.createdAt)}</td>
              <td>
                {execution.status === 'success' ? (
                  <span className="badge badge-success">成功</span>
                ) : (
                  <span className="badge badge-error" title={execution.errorCode ?? undefined}>
                    失敗{execution.httpStatus === null ? '' : `（${execution.httpStatus}）`}
                  </span>
                )}
              </td>
              <td className="mono">{execution.resolvedModel ?? execution.requestedModel}</td>
              <td className="num">{formatNumber(execution.questionCount)}</td>
              <td className="num">{formatBytes(execution.inputTextBytes)}</td>
              <td>
                {execution.inputFileKind === null
                  ? '—'
                  : `${fileKindLabels[execution.inputFileKind]} ${formatBytes(execution.inputFileBytes)}`}
              </td>
              <td className="num">{formatBytes(execution.requestBytes)}</td>
              <td className="num">{formatBytes(execution.responseBytes)}</td>
              <td className="num">{formatDuration(execution.jevDurationMs)}</td>
              <td className="num">{formatDuration(execution.totalDurationMs)}</td>
              <td className="num">{formatTokens(execution.inputTokens)}</td>
              <td className="num">{formatTokens(execution.outputTokens)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
