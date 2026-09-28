/** 入力検証エラー 1 件 */
export type ValidationIssue = {
  /** 対象項目のパス（例: questions.is_urgent.criteria） */
  path: string
  /** ユーザー向けメッセージ */
  message: string
}

/** 入力検証結果 */
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] }
