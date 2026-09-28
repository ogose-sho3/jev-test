'use client'

import { useRef } from 'react'
import { formatBytes } from '@/lib/format/format'
import { acceptedFileExtensions, jevLimits } from '@/models/jev'
import type { EvaluateState } from '@/types/evaluate-ui'
import styles from './evaluate.module.css'

export function StateInputSection({ input, setText, setTextAsJson, setFile, hasStateInput }: EvaluateState) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="card" aria-labelledby="state-title">
      <h2 id="state-title" className="section-title">
        評価対象（state）
      </h2>
      <div className="stack">
        <div>
          <div className={`${styles.row} ${styles.spaceBetween}`}>
            <label className="label" htmlFor="state-text">
              テキスト
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={input.textAsJson}
                onChange={(event) => setTextAsJson(event.target.checked)}
              />
              JSON として送信
            </label>
          </div>
          <textarea
            id="state-text"
            rows={8}
            value={input.text}
            maxLength={jevLimits.maxTextChars}
            onChange={(event) => setText(event.target.value)}
            placeholder="評価したい文章を入力します。例: Help! My payouts have been failing for 3 days."
            className={input.textAsJson ? 'mono' : undefined}
          />
        </div>
        <div>
          <label className="label" htmlFor="state-file">
            ファイル
          </label>
          <input
            ref={fileInputRef}
            id="state-file"
            type="file"
            accept={acceptedFileExtensions.join(',')}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          {input.file ? (
            <div className={styles.fileInfo}>
              <span>
                {input.file.name}（{formatBytes(input.file.size)}）
              </span>
              <button type="button" className="button button-small" onClick={clearFile}>
                解除
              </button>
            </div>
          ) : null}
          {input.fileError ? (
            <p className={styles.error} role="alert">
              {input.fileError}
            </p>
          ) : null}
          <p className="hint">
            対応形式: {acceptedFileExtensions.join(' ')}（{jevLimits.maxFileBytes / 1024 / 1024}MB まで）。PDF・Word
            はテキストを抽出して送信します（スキャン画像のみの PDF は不可）。
          </p>
        </div>
        <p className="hint">
          テキストとファイルを両方指定すると、state は <code>{'{ "text": …, "file": { "name": …, "content": … } }'}</code>{' '}
          になります。質問では <code>`text`</code> や <code>`file.content`</code> のように参照できます。
          {hasStateInput ? null : ' テキストかファイルのどちらかは必須です。'}
        </p>
      </div>
    </section>
  )
}
