import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextResponse } from 'next/server'
import { isAllowedEmail } from '@/lib/auth/email-domain'
import { problemResponse } from '@/lib/http/api-response'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { appErrors } from '@/models/errors'
import type { ProblemResponseBody } from '@/types/api'
import type { AuthenticatedUser } from '@/types/auth'

/** API ルートの認証結果 */
type RequireApiUserResult =
  | { ok: true; user: AuthenticatedUser; supabase: SupabaseClient }
  | { ok: false; response: NextResponse<ProblemResponseBody> }

/**
 * API ルートの入口で、ログイン済みかつ許可ドメインのユーザーであることを検証する。
 * Auth サーバーへ問い合わせる getUser を使い、失効したセッションも拒否する。
 */
export async function requireApiUser(): Promise<RequireApiUserResult> {
  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { ok: false, response: problemResponse(appErrors.unauthorized) }
  }
  const { id, email } = userData.user
  if (!email || !isAllowedEmail(email)) {
    return { ok: false, response: problemResponse(appErrors.forbiddenDomain) }
  }
  return { ok: true, user: { id, email }, supabase }
}
