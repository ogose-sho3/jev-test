import type { ExecutionRecord } from '@/types/execution'
import type { InputFileKind, JevAnswer } from '@/types/jev'

/** jev に送った state の構成 */
export type StateKind =
  /** テキストのみ（文字列） */
  | 'text'
  /** テキストを JSON として解釈した値 */
  | 'text-json'
  /** ファイルのみ（抽出テキスト） */
  | 'file'
  /** ファイルのみ（JSON ファイルの内容） */
  | 'file-json'
  /** テキストとファイルを `{ text, file }` にまとめたオブジェクト */
  | 'combined'

/** 質問ごとの回答 */
export type EvaluateAnswerItem = {
  /** 質問ID */
  id: string
  /** 回答 */
  answer: JevAnswer
}

/** jev 実行の計測値 */
export type EvaluateMetrics = {
  /** 質問数 */
  questionCount: number
  /** 入力テキストのサイズ（バイト） */
  inputTextBytes: number
  /** 入力ファイルのサイズ（バイト。ファイルなしは null） */
  inputFileBytes: number | null
  /** 入力ファイルの種別（ファイルなしは null） */
  inputFileKind: InputFileKind | null
  /** ファイルから抽出したテキストの文字数（ファイルなしは null） */
  extractedChars: number | null
  /** jev へ送信したリクエストのサイズ（バイト） */
  requestBytes: number
  /** jev から受信したレスポンスのサイズ（バイト） */
  responseBytes: number
  /** jev API の実行時間（ミリ秒） */
  jevDurationMs: number
  /** サーバーでの処理全体の時間（ミリ秒） */
  totalDurationMs: number
}

/** トークン消費量 */
export type EvaluateUsage = {
  /** 入力トークン数 */
  inputTokens: number
  /** 出力トークン数 */
  outputTokens: number
}

/** POST /api/jev/evaluate のレスポンス */
export type EvaluateResponse = {
  /** 実際に応答したモデル */
  model: string
  /** 送信した state の構成 */
  stateKind: StateKind
  /** 回答（質問の定義順） */
  answers: EvaluateAnswerItem[]
  /** トークン消費量（jev が返さなかった場合は null） */
  usage: EvaluateUsage | null
  /** 計測値 */
  metrics: EvaluateMetrics
  /** 実行ログを保存できたか */
  recorded: boolean
}

/** GET /api/me のレスポンス */
export type MeResponse = {
  /** ログイン中ユーザーのメールアドレス */
  email: string
}

/** GET /api/executions のレスポンス */
export type ExecutionListResponse = {
  /** 実行ログ（新しい順） */
  executions: ExecutionRecord[]
}
