import { appErrors } from '@/models/errors'
import type { ApiErrorData, ApiResult } from '@/types/api'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiErrorData(value: unknown): value is ApiErrorData {
  return isRecord(value) && typeof value.type === 'string' && typeof value.message === 'string'
}

/** 想定外の応答（JSON でない・形式違い・通信失敗）を表すエラー結果 */
export function unexpectedResult(status: number): ApiResult<never> {
  const fallback = status >= 400 && status < 500 ? appErrors.badRequest : appErrors.internalServerError
  if (status === 413) {
    return { ok: false, status, data: { type: appErrors.payloadTooLarge.type, message: appErrors.payloadTooLarge.message } }
  }
  return { ok: false, status: status || 500, data: { type: fallback.type, message: fallback.message } }
}

/** fetch の Response を ResponseBase 形式として読み取る */
export async function parseApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    return unexpectedResult(response.status)
  }
  if (!isRecord(body) || typeof body.ok !== 'boolean' || !('data' in body)) {
    return unexpectedResult(response.status)
  }
  if (body.ok && response.ok) {
    return { ok: true, status: response.status, data: body.data as T }
  }
  if (isApiErrorData(body.data)) {
    return { ok: false, status: response.status, data: body.data }
  }
  return unexpectedResult(response.status)
}
