import 'server-only'

import { NextResponse } from 'next/server'
import type { AppError, ProblemResponseBody, ResponseBase } from '@/types/api'

/** 成功レスポンスを返す */
export function okResponse<T>(payload: T, status = 200): NextResponse<ResponseBase<T>> {
  return NextResponse.json({ ok: true, status, data: payload }, { status })
}

/**
 * エラーレスポンスを返す。
 * 本文は ResponseBase 形式かつ RFC 9457 Problem Details（application/problem+json）。
 */
export function problemResponse(
  appError: AppError,
  options: { detail?: string; details?: unknown } = {},
): NextResponse<ProblemResponseBody> {
  const detail = options.detail ?? appError.message
  const body: ProblemResponseBody = {
    type: `urn:jev-sample:problem:${appError.type}`,
    title: appError.title,
    status: appError.status,
    detail,
    ok: false,
    data: {
      type: appError.type,
      message: detail,
      ...(options.details === undefined ? {} : { details: options.details }),
    },
  }
  return NextResponse.json(body, {
    status: appError.status,
    headers: { 'Content-Type': 'application/problem+json' },
  })
}
