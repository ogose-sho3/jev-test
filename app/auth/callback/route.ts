import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedEmail } from '@/lib/auth/email-domain'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loginErrorCodes } from '@/models/auth'
import { routes } from '@/models/routes'

/** OAuth コールバック: 認可コードをセッションに交換し、許可ドメインを検証する */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  const code = request.nextUrl.searchParams.get('code')
  const loginWithError = (errorCode: string) =>
    NextResponse.redirect(new URL(`${routes.login}?error=${errorCode}`, origin))

  if (!code) {
    // Before User Created フックでドメイン外のユーザー作成が拒否された場合もここに来る
    const providerError = request.nextUrl.searchParams.get('error_description')
    console.warn('oauth callback without code:', providerError)
    return loginWithError(loginErrorCodes.oauthFailed)
  }

  const supabase = await createSupabaseServerClient()
  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError || !sessionData.user) {
    console.error('exchangeCodeForSession failed:', exchangeError)
    return loginWithError(loginErrorCodes.oauthFailed)
  }

  if (!isAllowedEmail(sessionData.user.email)) {
    await supabase.auth.signOut()
    return loginWithError(loginErrorCodes.forbiddenDomain)
  }
  return NextResponse.redirect(new URL(routes.home, origin))
}
