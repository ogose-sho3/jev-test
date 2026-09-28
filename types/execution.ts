import type { InputFileKind } from '@/types/jev'

/** 実行結果の状態 */
export type ExecutionStatus = 'success' | 'error'

/** jev API 実行ログ（1 回の実行のメタデータ。入出力の内容は含まない） */
export type ExecutionRecord = {
  /** 実行ログID */
  id: string
  /** 実行日時（ISO 8601） */
  createdAt: string
  /** 実行結果 */
  status: ExecutionStatus
  /** エラー種別（成功時は null） */
  errorCode: string | null
  /** jev から返った HTTP ステータス（通信失敗時は null） */
  httpStatus: number | null
  /** 指定したモデル */
  requestedModel: string
  /** 実際に応答したモデル（失敗時は null） */
  resolvedModel: string | null
  /** 質問数 */
  questionCount: number
  /** 入力テキストのサイズ（バイト） */
  inputTextBytes: number
  /** 入力ファイルのサイズ（バイト。ファイルなしは null） */
  inputFileBytes: number | null
  /** 入力ファイルの種別（ファイルなしは null） */
  inputFileKind: InputFileKind | null
  /** jev へ送信したリクエストのサイズ（バイト） */
  requestBytes: number
  /** jev から受信したレスポンスのサイズ（バイト。失敗時は null） */
  responseBytes: number | null
  /** jev API の実行時間（ミリ秒。リトライを含む） */
  jevDurationMs: number
  /** サーバーでの処理全体の時間（ミリ秒。ファイル抽出を含む） */
  totalDurationMs: number
  /** 入力トークン数（取得できない場合は null） */
  inputTokens: number | null
  /** 出力トークン数（取得できない場合は null） */
  outputTokens: number | null
}

/** 実行ログの新規登録内容 */
export type ExecutionRecordInput = Omit<ExecutionRecord, 'id' | 'createdAt'>
