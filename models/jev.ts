/** 選択可能なモデル（先頭が既定値） */
export const jevModels = ['jev-latest', 'jev-preview', 'jev-1.13.0'] as const

/** 入力の上限値 */
export const jevLimits = {
  /** 入力テキストの最大文字数 */
  maxTextChars: 200_000,
  /**
   * 入力ファイルの最大サイズ（バイト）。
   * Vercel Functions のリクエストボディ上限（4.5MB）に収まるよう 4MB とする。
   */
  maxFileBytes: 4 * 1024 * 1024,
  /** ファイルから抽出したテキストの最大文字数 */
  maxExtractedChars: 400_000,
  /** 質問 JSON の最大文字数 */
  maxQuestionsChars: 200_000,
  /** 1 リクエストあたりの最大質問数 */
  maxQuestions: 200,
  /** Choice の最大選択肢数（jev の仕様） */
  maxChoiceOptions: 255,
  /** Score の段階数（jev の仕様） */
  minScoreLevels: 2,
  maxScoreLevels: 10,
  /** 質問IDの最大文字数 */
  maxQuestionIdLength: 100,
} as const

/** 受け付けるファイルの拡張子（accept 属性にも使用） */
export const acceptedFileExtensions = ['.txt', '.md', '.csv', '.tsv', '.json', '.pdf', '.docx'] as const

/** jev API 呼び出し設定 */
export const jevCallOptions = {
  /** 1 回の試行のタイムアウト（ミリ秒） */
  timeoutMs: 20_000,
  /** 429 / 529 / 5xx 時の最大リトライ回数 */
  maxRetries: 2,
} as const

/** 質問 JSON のテンプレート */
export const questionTemplates = {
  noul: {
    is_urgent: {
      type: 'noul',
      instructions: 'Does this message convey urgency or time-sensitivity?',
    },
  },
  choice: {
    department: {
      type: 'choice',
      instructions: 'Which team should handle this?',
      criteria: {
        billing: 'Payments, invoicing, refunds',
        technical: 'Bugs, outages, integrations',
        sales: 'Pricing, upgrades, new accounts',
      },
    },
  },
  score: {
    frustration: {
      type: 'score',
      instructions: 'How frustrated does the writer appear?',
      criteria: ['Calm, just stating facts', 'Frustrated but civil', 'Very angry, strong language'],
    },
  },
} as const
