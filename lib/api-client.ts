import { parseApiResponse, unexpectedResult } from '@/lib/http/parse-api-response'
import type { ApiResult } from '@/types/api'

async function request<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
  let response: Response
  try {
    response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store' })
  } catch {
    return unexpectedResult(0)
  }
  return parseApiResponse<T>(response)
}

/** クライアントコンポーネント用 API クライアント（相対 URL・同一オリジンの Cookie を送信） */
export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  /** multipart/form-data で送信する（Content-Type はブラウザが境界付きで設定する） */
  postForm: <T>(path: string, formData: FormData, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body: formData, signal }),
}
