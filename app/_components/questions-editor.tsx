'use client'

import type { EvaluateState, TemplateKey } from '@/types/evaluate-ui'
import styles from './evaluate.module.css'

const templateButtons: { key: TemplateKey; label: string }[] = [
  { key: 'noul', label: 'Noul（Yes/No）' },
  { key: 'choice', label: 'Choice（選択）' },
  { key: 'score', label: 'Score（段階）' },
  { key: 'all', label: '3 種類すべて' },
]

export function QuestionsEditor({
  input,
  setQuestions,
  applyTemplate,
  formatQuestions,
  questionsSyntaxError,
}: EvaluateState) {
  return (
    <section className="card" aria-labelledby="questions-title">
      <div className={`${styles.row} ${styles.spaceBetween}`}>
        <h2 id="questions-title" className="section-title">
          質問（questions）
        </h2>
        <button type="button" className="button button-small" onClick={formatQuestions}>
          整形
        </button>
      </div>
      <div className={styles.row} role="group" aria-label="テンプレート">
        <span className="hint">テンプレート:</span>
        {templateButtons.map((template) => (
          <button
            key={template.key}
            type="button"
            className="button button-small"
            onClick={() => applyTemplate(template.key)}
          >
            {template.label}
          </button>
        ))}
      </div>
      <label className="visually-hidden" htmlFor="questions">
        質問 JSON
      </label>
      <textarea
        id="questions"
        className={`mono ${styles.questionsEditor}`}
        style={{ marginTop: 12 }}
        value={input.questions}
        onChange={(event) => setQuestions(event.target.value)}
        spellCheck={false}
        aria-invalid={questionsSyntaxError !== null}
        aria-describedby="questions-help"
      />
      {questionsSyntaxError ? (
        <p className={styles.error} role="alert">
          {questionsSyntaxError}
        </p>
      ) : null}
      <p id="questions-help" className="hint">
        「質問ID: 質問」の JSON です。type は noul / choice / score。jev は英語での精度が最も高く、日本語は精度が下がる場合があります（
        <a href="https://docs.typesafe.ai/primitives" target="_blank" rel="noreferrer">
          仕様
        </a>
        ）。
      </p>
    </section>
  )
}
