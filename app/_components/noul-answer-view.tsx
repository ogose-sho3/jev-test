import { ProbabilityBar } from '@/components/probability-bar'
import { formatPercent } from '@/lib/format/format'
import type { JevNoulAnswer } from '@/types/jev'
import styles from './evaluate.module.css'

/** Yes の確率に応じた読み方（しきい値は表示上の目安） */
function describeNoul(noul: number): string {
  if (noul >= 0.8) {
    return 'Yes の可能性が高い'
  }
  if (noul <= 0.2) {
    return 'No の可能性が高い'
  }
  return '判断が分かれる'
}

export function NoulAnswerView({ answer }: { answer: JevNoulAnswer }) {
  return (
    <div>
      <p className={styles.headline}>
        Yes {formatPercent(answer.noul)} <span className={styles.subtle}>（{describeNoul(answer.noul)}）</span>
      </p>
      <div className={styles.bars}>
        <ProbabilityBar label="Yes" probability={answer.noul} highlighted={answer.noul >= 0.5} />
      </div>
    </div>
  )
}
