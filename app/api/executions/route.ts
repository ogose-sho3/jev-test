import type { NextRequest } from 'next/server'
import { requireApiUser } from '@/lib/auth/require-api-user'
import { listExecutions } from '@/lib/executions/execution-store'
import { okResponse, problemResponse } from '@/lib/http/api-response'
import { appErrors } from '@/models/errors'
import type { NextResponseBase } from '@/types/api'
import type { ExecutionListResponse } from '@/types/jev-api'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export async function GET(request: NextRequest): NextResponseBase<ExecutionListResponse> {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return auth.response
  }

  const rawLimit = request.nextUrl.searchParams.get('limit')
  const limit = rawLimit === null ? DEFAULT_LIMIT : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return problemResponse(appErrors.badRequest, {
      details: [{ path: 'limit', message: `limit は 1〜${MAX_LIMIT} の整数で指定してください。` }],
    })
  }

  try {
    const executions = await listExecutions(auth.supabase, limit)
    return okResponse({ executions })
  } catch (listError) {
    console.error('GET /api/executions failed:', listError)
    return problemResponse(appErrors.internalServerError)
  }
}
