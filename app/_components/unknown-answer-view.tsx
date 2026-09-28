import type { JevUnknownAnswer } from '@/types/jev'
import styles from './evaluate.module.css'

export function UnknownAnswerView({ answer }: { answer: JevUnknownAnswer }) {
  return (
    <div>
      <p className={styles.subtle}>想定外の形式の回答です。受信した内容をそのまま表示します。</p>
      <pre className={`mono ${styles.raw}`}>{JSON.stringify(answer.raw, null, 2) ?? 'null'}</pre>
    </div>
  )
}
