import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedEmail } from '@/lib/auth/email-domain'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { loginErrorCodes } from '@/models/auth'
import { apiPathPrefix } from '@/models/endpoints'
import { publicPathPrefixes, routes } from '@/models/routes'

function isPublicPath(pathname: string): boolean {
  return publicPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

function redirectToLogin(request: NextRequest, errorCode?: string): NextResponse {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = routes.login
  loginUrl.search = ''
  if (errorCode) {
    loginUrl.searchParams.set('error', errorCode)
  }
  return NextResponse.redirect(loginUrl)
}

/**
 * セッション Cookie を更新し、画面へのアクセスを認証・許可ドメインで振り分ける。
 * API（/api/**）は各ルートで認証するため、ここではリダイレクトしない。
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })
  const { url, publishableKey } = getSupabaseEnv()

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getClaims は JWT の署名を検証する（getSession と異なり Cookie の内容を鵜呑みにしない）
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith(apiPathPrefix) || isPublicPath(pathname)) {
    return response
  }
  if (!claims) {
    return redirectToLogin(request)
  }
  if (!isAllowedEmail(claims.email)) {
    await supabase.auth.signOut()
    const forbidden = redirectToLogin(request, loginErrorCodes.forbiddenDomain)
    for (const cookie of response.cookies.getAll()) {
      forbidden.cookies.set(cookie)
    }
    return forbidden
  }
  return response
}
