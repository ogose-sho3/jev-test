import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ALLOWED_EMAIL_DOMAIN, loginErrorCodes } from '@/models/auth'
import { routes } from '@/models/routes'

/** Google OAuth を開始する（PKCE の code verifier は Cookie に保存される） */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const origin = request.nextUrl.origin
  const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${routes.auth.callback}`,
      // hd はアカウント選択画面の絞り込みのみ。許可判定はコールバック・API・DB で行う
      queryParams: { hd: ALLOWED_EMAIL_DOMAIN, prompt: 'select_account' },
    },
  })

  if (oauthError || !oauthData.url) {
    console.error('signInWithOAuth failed:', oauthError)
    return NextResponse.redirect(new URL(`${routes.login}?error=${loginErrorCodes.oauthFailed}`, origin), 303)
  }
  return NextResponse.redirect(oauthData.url, 303)
}
