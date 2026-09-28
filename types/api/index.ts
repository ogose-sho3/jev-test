import type { NextResponse } from 'next/server'
import type { appErrors } from '@/models/errors'

/** アプリケーションエラー定義 1 件（models/errors.ts の値） */
export type AppError = (typeof appErrors)[keyof typeof appErrors]

/** レスポンス共通ラッパー */
export type ResponseBase<T> = {
  /** 処理成功可否 */
  ok: boolean
  /** HTTP ステータスコード */
  status: number
  /** レスポンスデータ（エラー時は ApiErrorData） */
  data: T
}

/** エラーレスポンスのデータ形式 */
export type ApiErrorData = {
  /** エラー種別（models/errors.ts のキーに対応） */
  type: string
  /** ユーザー向けメッセージ */
  message: string
  /** 補足情報（入力検証エラーの項目など） */
  details?: unknown
}

/**
 * エラーレスポンス本体。
 * ResponseBase 形式に加え、RFC 9457 Problem Details のメンバーをトップレベルに持つ。
 * （ok / data は RFC 9457 の拡張メンバーとして扱う）
 */
export type ProblemResponseBody = ResponseBase<ApiErrorData> & {
  /** 問題種別を示す URI 参照（RFC 9457） */
  type: string
  /** 問題種別の短い要約（RFC 9457） */
  title: string
  /** 今回の発生に固有の説明（RFC 9457） */
  detail: string
}

/** apiClient / serverApiClient の呼び出し結果（ok で成功・失敗を判別できる ResponseBase） */
export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: ApiErrorData }

/** API ルートハンドラーの返り値型エイリアス */
export type NextResponseBase<T> = Promise<NextResponse<ResponseBase<T> | ProblemResponseBody>>
