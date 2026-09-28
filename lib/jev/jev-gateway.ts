import 'server-only'

import {
  APIConnectionError,
  APIError,
  APITimeoutError,
  AuthenticationError,
  BadRequestError,
  PermissionDeniedError,
  RateLimitError,
  TypeSafeClient,
  UnprocessableEntityError,
  type EntryType,
  type Questions,
} from '@typesafe-ai/sdk'
import { utf8ByteLength } from '@/lib/text/byte-length'
import { appErrors } from '@/models/errors'
import { jevCallOptions } from '@/models/jev'
import type { AppError } from '@/types/api'
import type { JevEntry, JevQuestions } from '@/types/jev'

/** jev 呼び出しの成功結果 */
type JevCallSuccess = {
  ok: true
  /** 応答したモデル */
  model: string
  /** 回答マップ（未検証の生データ） */
  answers: unknown
  /** usage（未検証の生データ） */
  usage: unknown
  /** 実行時間（ミリ秒。リトライを含む） */
  durationMs: number
  /** レスポンスのサイズ（バイト） */
  responseBytes: number
}

/** jev 呼び出しの失敗結果 */
type JevCallFailure = {
  ok: false
  /** ユーザーに返すエラー */
  appError: AppError
  /** jev の HTTP ステータス（通信失敗時は null） */
  httpStatus: number | null
  /** 実行時間（ミリ秒） */
  durationMs: number
  /** ユーザーに見せてよい補足（入力検証エラーの内容のみ） */
  details?: string
}

/** jev 呼び出し結果 */
type JevCallResult = JevCallSuccess | JevCallFailure

let cachedClient: TypeSafeClient | null = null

function getClient(): TypeSafeClient {
  if (cachedClient) {
    return cachedClient
  }
  const apiKey = process.env.TYPESAFE_API_KEY
  if (!apiKey) {
    throw new Error('TYPESAFE_API_KEY is not set')
  }
  cachedClient = new TypeSafeClient({
    apiKey,
    timeout: jevCallOptions.timeoutMs,
    retry: { maxRetries: jevCallOptions.maxRetries },
    logLevel: 'off',
  })
  return cachedClient
}

/** jev の入力検証エラーの説明（ユーザー入力に関する内容）を短く切り詰める */
function toUserFacingDetail(message: string): string {
  return message.length > 1000 ? `${message.slice(0, 1000)}…` : message
}

/** SDK の例外を、ユーザー向けエラーと記録用ステータスへ変換する */
export function mapJevError(sdkError: unknown): Omit<JevCallFailure, 'ok' | 'durationMs'> {
  if (sdkError instanceof UnprocessableEntityError || sdkError instanceof BadRequestError) {
    return { appError: appErrors.jevRejected, httpStatus: sdkError.status, details: toUserFacingDetail(sdkError.message) }
  }
  if (sdkError instanceof RateLimitError) {
    return { appError: appErrors.jevRateLimited, httpStatus: sdkError.status }
  }
  if (sdkError instanceof AuthenticationError || sdkError instanceof PermissionDeniedError) {
    // API キーの設定不備。利用者には詳細を出さない
    return { appError: appErrors.jevUnavailable, httpStatus: sdkError.status }
  }
  if (sdkError instanceof APIError) {
    return { appError: sdkError.status === 529 ? appErrors.jevRateLimited : appErrors.jevUnavailable, httpStatus: sdkError.status }
  }
  if (sdkError instanceof APITimeoutError) {
    return { appError: appErrors.jevTimeout, httpStatus: null }
  }
  if (sdkError instanceof APIConnectionError) {
    return { appError: appErrors.jevUnavailable, httpStatus: null }
  }
  return { appError: appErrors.internalServerError, httpStatus: null }
}

/** ログ用に SDK 例外を要約する */
function summarizeJevError(sdkError: unknown): Record<string, unknown> {
  if (sdkError instanceof APIError) {
    return { name: sdkError.name, status: sdkError.status, requestId: sdkError.requestId, message: sdkError.message }
  }
  if (sdkError instanceof Error) {
    return { name: sdkError.name, message: sdkError.message, cause: sdkError.cause }
  }
  return { error: sdkError }
}

/**
 * jev（TypeSafe System One API）を呼び出す。
 * 失敗は例外ではなく JevCallFailure として返し、原因はサーバーログに記録する。
 */
export async function callJev(request: { model: string; state: JevEntry; questions: JevQuestions }): Promise<JevCallResult> {
  const client = getClient()
  const startedAt = performance.now()
  try {
    const { data: result, response } = await client
      .systemOne({
        model: request.model,
        // 形式は questions-validator / state-builder で jev の仕様どおりに検証済み
        state: request.state as EntryType,
        questions: request.questions as unknown as Questions,
      })
      .withResponse()
    const durationMs = Math.round(performance.now() - startedAt)
    const contentLength = Number(response.headers.get('content-length'))
    const responseBytes =
      Number.isInteger(contentLength) && contentLength > 0 ? contentLength : utf8ByteLength(JSON.stringify(result))
    return { ok: true, model: result.model, answers: result.answers, usage: result.usage, durationMs, responseBytes }
  } catch (sdkError) {
    const durationMs = Math.round(performance.now() - startedAt)
    // エラー本文（body）には入力内容が含まれうるため、要約のみ記録する
    console.error('jev systemOne call failed:', summarizeJevError(sdkError))
    return { ok: false, durationMs, ...mapJevError(sdkError) }
  }
}
