import { ProbabilityBar } from '@/components/probability-bar'
import { formatPercent } from '@/lib/format/format'
import type { JevChoiceAnswer } from '@/types/jev'
import styles from './evaluate.module.css'

export function ChoiceAnswerView({ answer }: { answer: JevChoiceAnswer }) {
  const sortedOptions = Object.entries(answer.probabilities).sort(([, left], [, right]) => right - left)
  return (
    <div>
      <p className={styles.headline}>{answer.choice}</p>
      <p className={styles.subtle}>確信度 {formatPercent(answer.confidence)}</p>
      <div className={styles.bars}>
        {sortedOptions.map(([option, probability]) => (
          <ProbabilityBar key={option} label={option} probability={probability} highlighted={option === answer.choice} />
        ))}
      </div>
    </div>
  )
}
