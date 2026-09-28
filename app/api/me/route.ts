import { requireApiUser } from '@/lib/auth/require-api-user'
import { okResponse } from '@/lib/http/api-response'
import type { NextResponseBase } from '@/types/api'
import type { MeResponse } from '@/types/jev-api'

export async function GET(): NextResponseBase<MeResponse> {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return auth.response
  }
  return okResponse({ email: auth.user.email })
}
