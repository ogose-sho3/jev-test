'use client'

import type { EvaluateFailure, EvaluateStatus } from '@/types/evaluate-ui'
import type { EvaluateResponse } from '@/types/jev-api'
import { AnswerCard } from './answer-card'
import styles from './evaluate.module.css'
import { EvaluateErrorMessage } from './evaluate-error-message'
import { RawJsonView } from './raw-json-view'
import { ResultMetrics } from './result-metrics'

export function ResultPanel({
  status,
  evaluation,
  failure,
}: {
  status: EvaluateStatus
  evaluation: EvaluateResponse | null
  failure: EvaluateFailure | null
}) {
  return (
    <section className="card stack" aria-labelledby="result-title" aria-live="polite" aria-busy={status === 'running'}>
      <h2 id="result-title" className="section-title" style={{ marginBottom: 0 }}>
        結果
      </h2>
      {status === 'idle' ? <p className={styles.placeholder}>入力して「実行する」を押すと、ここに回答が表示されます。</p> : null}
      {status === 'running' ? (
        <div className="stack">
          <div className="skeleton" style={{ height: 64 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
      ) : null}
      {status === 'error' && failure ? <EvaluateErrorMessage failure={failure} /> : null}
      {status === 'success' && evaluation ? (
        <>
          {evaluation.recorded ? null : (
            <p className="alert alert-warning">結果は取得できましたが、実行ログの保存に失敗しました。</p>
          )}
          <ResultMetrics evaluation={evaluation} />
          {evaluation.answers.map((item) => (
            <AnswerCard key={item.id} item={item} />
          ))}
          <RawJsonView value={evaluation} />
        </>
      ) : null}
    </section>
  )
}
