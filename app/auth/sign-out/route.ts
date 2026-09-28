import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { routes } from '@/models/routes'

/** ログアウトしてログイン画面へ戻る */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { error: signOutError } = await supabase.auth.signOut()
  if (signOutError) {
    console.error('signOut failed:', signOutError)
  }
  return NextResponse.redirect(new URL(routes.login, request.nextUrl.origin), 303)
}
