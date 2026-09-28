import { ProbabilityBar } from '@/components/probability-bar'
import { entryToLabel, formatPercent } from '@/lib/format/format'
import type { JevScoreAnswer } from '@/types/jev'
import styles from './evaluate.module.css'

export function ScoreAnswerView({ answer }: { answer: JevScoreAnswer }) {
  const levels = Object.keys(answer.legend)
    .map(Number)
    .filter(Number.isInteger)
    .sort((left, right) => left - right)
  const maxLevel = levels.length > 0 ? Math.max(...levels) : 0
  const position = maxLevel > 0 ? Math.min(Math.max(answer.score / maxLevel, 0), 1) : 0
  const nearestLevel = String(Math.round(answer.score))

  return (
    <div>
      <p className={styles.headline}>
        {answer.score.toFixed(2)} <span className={styles.subtle}>/ {maxLevel}</span>
      </p>
      <p className={styles.subtle}>
        最も近い段階: {entryToLabel(answer.legend[nearestLevel])}　確信度 {formatPercent(answer.confidence)}
      </p>
      <div className={styles.scale} aria-hidden="true">
        <div className={styles.scaleMarker} style={{ left: `${position * 100}%` }} />
      </div>
      <div className={styles.scaleLabels} aria-hidden="true">
        <span>0</span>
        <span>{maxLevel}</span>
      </div>
      <div className={styles.bars}>
        {levels.map((level) => (
          <ProbabilityBar
            key={level}
            label={`${level}: ${entryToLabel(answer.legend[String(level)])}`}
            probability={answer.probabilities[String(level)] ?? 0}
            highlighted={String(level) === nearestLevel}
          />
        ))}
      </div>
    </div>
  )
}
