import 'server-only'

import { serverApiClient } from '@/lib/server-api-client'
import { endpoints } from '@/models/endpoints'
import type { ExecutionListResponse, MeResponse } from '@/types/jev-api'

/**
 * Server-side service entry point.
 *
 * Server Components use this entry point. Data is fetched through the app's own API
 * (serverApiClient forwards the session cookie) so authorization stays in API routes.
 */
export const meServerService = {
  /** ログイン中ユーザーを取得する */
  get: () => serverApiClient.get<MeResponse>(endpoints.me),
}

export const executionServerService = {
  /** 自分の実行ログを新しい順に取得する */
  list: () => serverApiClient.get<ExecutionListResponse>(endpoints.executions.list),
}
