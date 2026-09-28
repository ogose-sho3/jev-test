import type { JevAnswer, JevEntry } from '@/types/jev'
import type { EvaluateAnswerItem, EvaluateUsage } from '@/types/jev-api'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isProbabilityMap(value: unknown): value is Record<string, number> {
  return isPlainObject(value) && Object.values(value).every(isFiniteNumber)
}

/** jev の回答 1 件を型付きの回答へ変換する（想定外の形式は unknown として生データを保持する） */
export function normalizeAnswer(raw: unknown): JevAnswer {
  if (!isPlainObject(raw)) {
    return { type: 'unknown', raw }
  }
  if (raw.type === 'noul' && isFiniteNumber(raw.noul)) {
    return { type: 'noul', noul: raw.noul }
  }
  if (
    raw.type === 'choice' &&
    typeof raw.choice === 'string' &&
    isProbabilityMap(raw.probabilities) &&
    isFiniteNumber(raw.confidence)
  ) {
    return { type: 'choice', choice: raw.choice, probabilities: raw.probabilities, confidence: raw.confidence }
  }
  if (
    raw.type === 'score' &&
    isFiniteNumber(raw.score) &&
    isPlainObject(raw.legend) &&
    isProbabilityMap(raw.probabilities) &&
    isFiniteNumber(raw.confidence)
  ) {
    return {
      type: 'score',
      score: raw.score,
      legend: raw.legend as Record<string, JevEntry>,
      probabilities: raw.probabilities,
      confidence: raw.confidence,
    }
  }
  return { type: 'unknown', raw }
}

/** 回答マップを質問の定義順の配列へ変換する（質問にない回答も末尾に残す） */
export function normalizeAnswers(questionIds: string[], rawAnswers: unknown): EvaluateAnswerItem[] {
  const answerMap = isPlainObject(rawAnswers) ? rawAnswers : {}
  const orderedIds = [...questionIds, ...Object.keys(answerMap).filter((id) => !questionIds.includes(id))]
  return orderedIds.map((id) => ({
    id,
    answer: Object.hasOwn(answerMap, id) ? normalizeAnswer(answerMap[id]) : { type: 'unknown', raw: null },
  }))
}

/** usage をトークン数へ変換する（取得できない場合は null） */
export function normalizeUsage(rawUsage: unknown): EvaluateUsage | null {
  if (!isPlainObject(rawUsage)) {
    return null
  }
  const { input_tokens: inputTokens, output_tokens: outputTokens } = rawUsage
  if (!isFiniteNumber(inputTokens) || !isFiniteNumber(outputTokens)) {
    return null
  }
  return { inputTokens, outputTokens }
}
