/** 実行ログの集計値 */
export type ExecutionSummary = {
  /** 実行回数 */
  totalCount: number
  /** 成功回数 */
  successCount: number
  /** 失敗回数 */
  errorCount: number
  /** 成功した実行の平均 jev 実行時間（ミリ秒。成功がなければ null） */
  averageJevDurationMs: number | null
  /** 成功した実行の入力トークン合計 */
  totalInputTokens: number
  /** 成功した実行の出力トークン合計 */
  totalOutputTokens: number
}
