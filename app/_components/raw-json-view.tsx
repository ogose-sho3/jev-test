import styles from './evaluate.module.css'

export function RawJsonView({ value }: { value: unknown }) {
  return (
    <details className={styles.details}>
      <summary>レスポンス JSON を表示</summary>
      <pre className={`mono ${styles.raw}`} style={{ marginTop: 8 }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  )
}
