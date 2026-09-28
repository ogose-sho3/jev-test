import { formatPercent } from '@/lib/format/format'
import styles from './probability-bar.module.css'

/** 確率を横棒で表示する 1 行 */
export function ProbabilityBar({
  label,
  probability,
  highlighted = false,
}: {
  label: string
  probability: number
  highlighted?: boolean
}) {
  const clamped = Math.min(Math.max(probability, 0), 1)
  return (
    <div className={styles.row}>
      <span className={highlighted ? `${styles.label} ${styles.labelStrong}` : styles.label} title={label}>
        {label}
      </span>
      <div
        className={styles.track}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={clamped}
        aria-valuetext={formatPercent(clamped)}
      >
        <div
          className={highlighted ? `${styles.fill} ${styles.fillStrong}` : styles.fill}
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
      <span className={styles.value}>{formatPercent(clamped)}</span>
    </div>
  )
}
