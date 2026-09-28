import type { NextRequest } from 'next/server'
import { requireApiUser } from '@/lib/auth/require-api-user'
import { okResponse, problemResponse } from '@/lib/http/api-response'
import { evaluate } from '@/lib/jev/evaluate-service'
import { appErrors } from '@/models/errors'
import { jevLimits } from '@/models/jev'
import type { NextResponseBase } from '@/types/api'
import type { EvaluateResponse } from '@/types/jev-api'

export const runtime = 'nodejs'
// ファイル抽出 + jev 呼び出し（タイムアウト 20 秒 × リトライ）に余裕を持たせる
export const maxDuration = 60

/** multipart 全体の上限（ファイル上限 + テキスト・質問の分） */
const MAX_REQUEST_BYTES = jevLimits.maxFileBytes + 512 * 1024

export async function POST(request: NextRequest): NextResponseBase<EvaluateResponse> {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return auth.response
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.startsWith('multipart/form-data')) {
    return problemResponse(appErrors.badRequest, { detail: 'multipart/form-data で送信してください。' })
  }
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return problemResponse(appErrors.payloadTooLarge)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (parseError) {
    console.warn('POST /api/jev/evaluate: invalid multipart body', parseError)
    return problemResponse(appErrors.badRequest)
  }

  try {
    const outcome = await evaluate(formData, auth.user, auth.supabase)
    if (!outcome.ok) {
      return problemResponse(outcome.appError, { details: outcome.details })
    }
    return okResponse(outcome.response)
  } catch (evaluateError) {
    console.error('POST /api/jev/evaluate failed:', evaluateError)
    return problemResponse(appErrors.internalServerError)
  }
}
