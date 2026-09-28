import { apiClient } from '@/lib/api-client'
import { endpoints } from '@/models/endpoints'
import type { EvaluateResponse } from '@/types/jev-api'

/** jev 評価リクエスト（画面の入力値） */
export type EvaluateRequest = {
  /** 入力テキスト */
  text: string
  /** テキストを JSON として解釈するか */
  textAsJson: boolean
  /** 質問 JSON（文字列のまま送信し、サーバーで検証する） */
  questions: string
  /** モデル */
  model: string
  /** 添付ファイル */
  file: File | null
}

export const jevService = {
  /** jev で評価する */
  evaluate: (input: EvaluateRequest, signal?: AbortSignal) => {
    const formData = new FormData()
    formData.set('text', input.text)
    formData.set('textAsJson', input.textAsJson ? 'true' : 'false')
    formData.set('questions', input.questions)
    formData.set('model', input.model)
    if (input.file) {
      formData.set('file', input.file)
    }
    return apiClient.postForm<EvaluateResponse>(endpoints.jev.evaluate, formData, signal)
  },
}
