'use client'

import type { FormEvent } from 'react'
import { jevModels } from '@/models/jev'
import type { EvaluateState } from '@/types/evaluate-ui'
import styles from './evaluate.module.css'
import { QuestionsEditor } from './questions-editor'
import { StateInputSection } from './state-input-section'

export function EvaluateForm(evaluateState: EvaluateState) {
  const { input, setModel, submit, canSubmit, status } = evaluateState

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <StateInputSection {...evaluateState} />
      <QuestionsEditor {...evaluateState} />
      <div className={`card ${styles.submitRow}`}>
        <div className={styles.modelField}>
          <label className="label" htmlFor="model">
            モデル
          </label>
          <select id="model" value={input.model} onChange={(event) => setModel(event.target.value)}>
            {jevModels.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button button-primary" disabled={!canSubmit}>
          {status === 'running' ? '実行中…' : '実行する'}
        </button>
      </div>
    </form>
  )
}
