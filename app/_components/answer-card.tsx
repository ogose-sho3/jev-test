import type { EvaluateAnswerItem } from '@/types/jev-api'
import { AnswerBody } from './answer-body'
import styles from './evaluate.module.css'

const typeLabels: Record<EvaluateAnswerItem['answer']['type'], string> = {
  noul: 'Noul',
  choice: 'Choice',
  score: 'Score',
  unknown: '不明な形式',
}

export function AnswerCard({ item }: { item: EvaluateAnswerItem }) {
  return (
    <article className={styles.answerCard} aria-label={`質問 ${item.id} の回答`}>
      <div className={styles.answerHeader}>
        <span className={styles.answerId}>{item.id}</span>
        <span className="badge badge-primary">{typeLabels[item.answer.type]}</span>
      </div>
      <AnswerBody answer={item.answer} />
    </article>
  )
}
