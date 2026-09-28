import 'server-only'

import { redirect } from 'next/navigation'
import { loginErrorCodes } from '@/models/auth'
import { routes } from '@/models/routes'

/** データローダーで API が 401 / 403 を返した場合にログイン画面へ遷移させる */
export function redirectOnAuthError(status: number): void {
  if (status === 401) {
    redirect(routes.login)
  }
  if (status === 403) {
    redirect(`${routes.login}?error=${loginErrorCodes.forbiddenDomain}`)
  }
}
