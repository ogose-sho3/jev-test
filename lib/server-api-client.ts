import 'server-only'

import { cookies } from 'next/headers'
import { parseApiResponse, unexpectedResult } from '@/lib/http/parse-api-response'
import type { ApiResult } from '@/types/api'

/** 自 API の絶対 URL の基点（APP_BASE_URL → Vercel のデプロイ URL → ローカル） */
function getBaseUrl(): string {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return `http://localhost:${process.env.PORT ?? 3000}`
}

async function request<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ')

  let response: Response
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      cache: 'no-store',
      headers: { ...init.headers, cookie: cookieHeader },
    })
  } catch (fetchError) {
    console.error(`serverApiClient ${init.method} ${path} failed:`, fetchError)
    return unexpectedResult(0)
  }
  return parseApiResponse<T>(response)
}

/** Server Component 用 API クライアント（絶対 URL・ログイン中ユーザーの Cookie を転送） */
export const serverApiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
}
