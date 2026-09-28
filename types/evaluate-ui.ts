import type { useEvaluate } from '@/app/_hooks/use-evaluate'
import type { questionTemplates } from '@/models/jev'
import type { ValidationIssue } from '@/types/validation'

/** 実行画面の実行状態 */
export type EvaluateStatus = 'idle' | 'running' | 'success' | 'error'

/** 実行エラーの表示内容 */
export type EvaluateFailure = {
  /** メッセージ */
  message: string
  /** 入力検証エラーの項目 */
  issues: ValidationIssue[]
  /** jev からの補足（入力検証の内容） */
  detail: string | null
}

/** 質問テンプレートの種類（all は全種類の組み合わせ） */
export type TemplateKey = keyof typeof questionTemplates | 'all'

/** 実行画面の状態とハンドラ（useEvaluate の戻り値） */
export type EvaluateState = ReturnType<typeof useEvaluate>
