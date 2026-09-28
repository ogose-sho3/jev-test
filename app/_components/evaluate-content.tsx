'use client'

import { useEvaluate } from '../_hooks/use-evaluate'
import styles from './evaluate.module.css'
import { EvaluateForm } from './evaluate-form'
import { ResultPanel } from './result-panel'

export function EvaluateContent() {
  const evaluateState = useEvaluate()
  return (
    <main className="page">
      <h1 className={styles.heading}>jev で評価する</h1>
      <div className={styles.layout}>
        <EvaluateForm {...evaluateState} />
        <ResultPanel status={evaluateState.status} evaluation={evaluateState.evaluation} failure={evaluateState.failure} />
      </div>
    </main>
  )
}
