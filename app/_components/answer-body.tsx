import type { JevAnswer } from '@/types/jev'
import { ChoiceAnswerView } from './choice-answer-view'
import { NoulAnswerView } from './noul-answer-view'
import { ScoreAnswerView } from './score-answer-view'
import { UnknownAnswerView } from './unknown-answer-view'

/** 回答の種類に応じて表示を切り替える */
export function AnswerBody({ answer }: { answer: JevAnswer }) {
  switch (answer.type) {
    case 'noul':
      return <NoulAnswerView answer={answer} />
    case 'choice':
      return <ChoiceAnswerView answer={answer} />
    case 'score':
      return <ScoreAnswerView answer={answer} />
    default:
      return <UnknownAnswerView answer={answer} />
  }
}
