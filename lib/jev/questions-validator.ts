import { jevLimits } from '@/models/jev'
import type { JevEntry, JevNoulQuestion, JevQuestion, JevQuestions } from '@/types/jev'
import type { ValidationIssue, ValidationResult } from '@/types/validation'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 値が JSON として表現可能な構造化値かを判定する */
function isJevEntry(value: unknown, depth = 0): value is JevEntry {
  if (depth > 32) {
    return false
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true
  }
  if (typeof value === 'number') {
    return Number.isFinite(value)
  }
  if (Array.isArray(value)) {
    return value.every((item) => isJevEntry(item, depth + 1))
  }
  if (isPlainObject(value)) {
    return Object.values(value).every((item) => isJevEntry(item, depth + 1))
  }
  return false
}

/** 選択肢・段階・Yes/No の説明として使える値（文字列・オブジェクト・配列・null）かを判定する */
function isDescription(value: unknown): boolean {
  if (value === null || typeof value === 'string') {
    return true
  }
  return (Array.isArray(value) || isPlainObject(value)) && isJevEntry(value)
}

/** instructions が空でない文字列・オブジェクト・配列かを判定する */
function isNonEmptyInstructions(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0 && isJevEntry(value)
  }
  if (isPlainObject(value)) {
    return Object.keys(value).length > 0 && isJevEntry(value)
  }
  return false
}

function validateQuestion(id: string, value: unknown, issues: ValidationIssue[]): JevQuestion | null {
  const path = `questions.${id}`
  if (!isPlainObject(value)) {
    issues.push({ path, message: '質問はオブジェクトで指定してください。' })
    return null
  }
  const { type, instructions, criteria } = value
  const allowedKeys = ['type', 'instructions', 'criteria']
  const unknownKeys = Object.keys(value).filter((key) => !allowedKeys.includes(key))
  if (unknownKeys.length > 0) {
    issues.push({ path, message: `未対応の項目があります: ${unknownKeys.join(', ')}` })
  }
  if (!isNonEmptyInstructions(instructions)) {
    issues.push({ path: `${path}.instructions`, message: 'instructions（質問文）を指定してください。' })
  }

  if (type === 'noul') {
    if (criteria !== undefined && criteria !== null) {
      const criteriaIsValid =
        isPlainObject(criteria) &&
        Object.keys(criteria).every((key) => key === 'true' || key === 'false') &&
        Object.values(criteria).every(isDescription)
      if (!criteriaIsValid) {
        issues.push({
          path: `${path}.criteria`,
          message: 'noul の criteria は true / false のみを持つオブジェクトで指定してください。',
        })
      }
    }
    const noulQuestion: JevNoulQuestion = { type, instructions: instructions as JevEntry }
    if (criteria !== undefined) {
      noulQuestion.criteria = criteria as JevNoulQuestion['criteria']
    }
    return noulQuestion
  }

  if (type === 'choice') {
    const optionCount = isPlainObject(criteria) ? Object.keys(criteria).length : 0
    if (!isPlainObject(criteria) || !Object.values(criteria).every(isDescription)) {
      issues.push({ path: `${path}.criteria`, message: 'choice の criteria は「選択肢名: 説明」のオブジェクトで指定してください。' })
    } else if (optionCount < 2 || optionCount > jevLimits.maxChoiceOptions) {
      issues.push({
        path: `${path}.criteria`,
        message: `choice の選択肢は 2〜${jevLimits.maxChoiceOptions} 個で指定してください。`,
      })
    } else if (Object.keys(criteria).some((option) => option.trim().length === 0)) {
      issues.push({ path: `${path}.criteria`, message: '空の選択肢名は指定できません。' })
    }
    return { type, instructions: instructions as JevEntry, criteria: criteria as Record<string, JevEntry> }
  }

  if (type === 'score') {
    if (!Array.isArray(criteria) || !criteria.every(isDescription)) {
      issues.push({ path: `${path}.criteria`, message: 'score の criteria は段階の説明を低い順に並べた配列で指定してください。' })
    } else if (criteria.length < jevLimits.minScoreLevels || criteria.length > jevLimits.maxScoreLevels) {
      issues.push({
        path: `${path}.criteria`,
        message: `score の段階は ${jevLimits.minScoreLevels}〜${jevLimits.maxScoreLevels} 個で指定してください。`,
      })
    }
    return { type, instructions: instructions as JevEntry, criteria: criteria as JevEntry[] }
  }

  issues.push({ path: `${path}.type`, message: 'type は noul / choice / score のいずれかを指定してください。' })
  return null
}

/**
 * 質問 JSON 文字列を検証し、jev に送信できる質問マップへ変換する。
 * jev の API 仕様（https://docs.typesafe.ai/api）の制約をサーバー側で事前に確認する。
 */
export function parseQuestions(raw: unknown): ValidationResult<JevQuestions> {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { ok: false, issues: [{ path: 'questions', message: '質問（JSON）を入力してください。' }] }
  }
  if (raw.length > jevLimits.maxQuestionsChars) {
    return {
      ok: false,
      issues: [{ path: 'questions', message: `質問 JSON は ${jevLimits.maxQuestionsChars.toLocaleString()} 文字以内で入力してください。` }],
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, issues: [{ path: 'questions', message: '質問が JSON として正しくありません。' }] }
  }
  if (!isPlainObject(parsed)) {
    return { ok: false, issues: [{ path: 'questions', message: '質問は「質問ID: 質問」のオブジェクトで指定してください。' }] }
  }

  const entries = Object.entries(parsed)
  if (entries.length === 0) {
    return { ok: false, issues: [{ path: 'questions', message: '質問を 1 つ以上指定してください。' }] }
  }
  if (entries.length > jevLimits.maxQuestions) {
    return { ok: false, issues: [{ path: 'questions', message: `質問は ${jevLimits.maxQuestions} 個以内にしてください。` }] }
  }

  const issues: ValidationIssue[] = []
  const validEntries: [string, JevQuestion][] = []
  for (const [id, value] of entries) {
    if (id.trim().length === 0 || id.length > jevLimits.maxQuestionIdLength) {
      issues.push({ path: 'questions', message: `質問IDは 1〜${jevLimits.maxQuestionIdLength} 文字で指定してください。` })
      continue
    }
    const question = validateQuestion(id, value, issues)
    if (question) {
      validEntries.push([id, question])
    }
  }
  if (issues.length > 0) {
    return { ok: false, issues }
  }
  // Object.fromEntries は "__proto__" などの ID も通常のプロパティとして扱う
  const questions: JevQuestions = Object.fromEntries(validEntries)
  return { ok: true, value: questions }
}
