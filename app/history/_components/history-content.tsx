import type { ExecutionRecord } from '@/types/execution'
import { HistorySummary } from './history-summary'
import { HistoryTable } from './history-table'

export function HistoryContent({ executions }: { executions: ExecutionRecord[] }) {
  return (
    <main className="page stack">
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>実行履歴</h1>
        <p className="hint">
          自分の実行のうち直近 {executions.length} 件を表示しています。入力・出力の内容は保存していません（サイズ・実行時間・トークン数のみ）。
        </p>
      </div>
      {executions.length === 0 ? (
        <p className="card hint" style={{ textAlign: 'center', padding: 40 }}>
          まだ実行履歴はありません。
        </p>
      ) : (
        <>
          <HistorySummary executions={executions} />
          <HistoryTable executions={executions} />
        </>
      )}
    </main>
  )
}
